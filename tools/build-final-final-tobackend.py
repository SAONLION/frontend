"""result_tobackend를 통째로 복사한 뒤 제품 컷의 좌우 중심을 보정해 final_final_tobackend를 만든다.

보정 알고리즘은 프론트엔드가 쓰는 tools/recenter-cutouts.py와 같다. 알파 bounding box 정렬은
지퍼풀·스트랩처럼 한쪽으로 얇게 튀어나온 요소까지 폭에 포함해서 제품 본체가 반대쪽으로 치우쳐
보이는데, 알파 질량 중심을 캔버스 가운데로 옮기면 본체 기준으로 정렬된다.

- 대상: image_classifications의 shot_type이 `product`인 컷만. `model`은 인물 구도가 의도된
  것이라 건드리지 않는다.
- 이미지 바이트가 바뀌므로 byte_size와 sha256을 담고 있는 5곳을 함께 갱신한다.
  data/original_images.ndjson, data/product_image_sets.ndjson,
  mysql/csv/original_images.csv, data/catalog.sqlite, data/catalog.sqlite3
- 가로·세로 픽셀 수와 파일 경로·이름은 그대로라 백엔드 적재 코드는 바꿀 필요가 없다.

사용법:
    python3 tools/build-final-final-tobackend.py
    python3 tools/build-final-final-tobackend.py --limit 20   # 앞 20장만 (리허설)
"""

import argparse
import csv
import hashlib
import importlib.util
import json
import multiprocessing
import os
import shutil
import sqlite3
import sys
import time

SOURCE = 'result_tobackend'
TARGET = 'final_final_tobackend'
# 전달본은 quality 85로 변환되어 있다. 재저장도 같은 설정을 쓴다.
WEBP_QUALITY = 85
TARGET_SHOT_TYPE = 'product'

csv.field_size_limit(10 ** 9)


# 워커 프로세스마다 한 번만 로드한다.
_recenter = None


def load_recenter():
    spec = importlib.util.spec_from_file_location(
        'recenter_cutouts', os.path.join(os.path.dirname(__file__), 'recenter-cutouts.py'))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.recenter


def worker(job):
    """이미지 한 장을 보정하고 (local_path, shift, byte_size, sha256)을 돌려준다."""
    global _recenter
    if _recenter is None:
        _recenter = load_recenter()

    absolute, local_path = job
    try:
        shift = _recenter(absolute, apply=True, quality=WEBP_QUALITY)
    except Exception as error:  # 손상 이미지 하나가 전체를 멈추지 않게 한다
        return (local_path, None, str(error), None)
    if shift == 0.0:
        return (local_path, 0.0, None, None)
    byte_size, sha256 = digest(absolute)
    return (local_path, shift, byte_size, sha256)


def log(message: str) -> None:
    print(f'[{time.strftime("%H:%M:%S")}] {message}', flush=True)


def product_shots(root: str) -> set:
    path = os.path.join(root, 'mysql', 'csv', 'image_classifications.csv')
    with open(path, newline='', encoding='utf-8') as handle:
        return {
            (row['style_number'], int(row['position']))
            for row in csv.DictReader(handle)
            if row['shot_type'] == TARGET_SHOT_TYPE
        }


def digest(path: str) -> tuple:
    with open(path, 'rb') as handle:
        data = handle.read()
    return len(data), hashlib.sha256(data).hexdigest()


def rewrite_ndjson(path: str, updates: dict, nested_key: str | None = None) -> int:
    if not os.path.exists(path):
        return 0
    changed = 0
    lines = []
    with open(path, encoding='utf-8') as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            record = json.loads(line)
            targets = record.get(nested_key, []) if nested_key else [record]
            for target in targets:
                key = target.get('local_path')
                if key in updates:
                    target['byte_size'], target['sha256'] = updates[key]
                    changed += 1
            lines.append(json.dumps(record, ensure_ascii=False))
    with open(path, 'w', encoding='utf-8') as handle:
        handle.write('\n'.join(lines) + '\n')
    return changed


def rewrite_csv(path: str, updates: dict) -> int:
    if not os.path.exists(path):
        return 0
    with open(path, newline='', encoding='utf-8') as handle:
        reader = csv.DictReader(handle)
        fields = reader.fieldnames
        rows = list(reader)
    changed = 0
    for row in rows:
        if row.get('local_path') in updates:
            row['byte_size'], row['sha256'] = (str(value) for value in updates[row['local_path']])
            changed += 1
    with open(path, 'w', newline='', encoding='utf-8') as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)
    return changed


def rewrite_sqlite(path: str, updates: dict) -> int:
    if not os.path.exists(path):
        return 0
    connection = sqlite3.connect(path)
    changed = 0
    for local_path, (byte_size, sha256) in updates.items():
        cursor = connection.execute(
            'UPDATE original_images SET byte_size = ?, sha256 = ? WHERE local_path = ?',
            (byte_size, sha256, local_path))
        changed += cursor.rowcount
    connection.commit()
    connection.close()
    return changed


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--limit', type=int, default=0, help='앞 N장만 처리 (리허설용)')
    args = parser.parse_args()

    started = time.time()
    recenter = load_recenter()

    if os.path.exists(TARGET):
        log(f'{TARGET}가 이미 있어 지우고 다시 만듭니다.')
        shutil.rmtree(TARGET)

    log(f'{SOURCE} → {TARGET} 복사 시작 (약 573MB)')
    shutil.copytree(SOURCE, TARGET)
    log('복사 완료')

    targets = product_shots(TARGET)
    log(f'제품 컷 {len(targets)}장 보정 시작 (모델 컷은 원본 유지)')

    jobs = []
    for style_number, position in sorted(targets):
        directory = os.path.join(TARGET, 'images_original', style_number)
        if not os.path.isdir(directory):
            continue
        matches = [name for name in os.listdir(directory) if name.startswith(f'{position:02d}-')]
        if not matches:
            continue
        jobs.append((os.path.join(directory, matches[0]),
                     f'images_original/{style_number}/{matches[0]}'))

    if args.limit:
        jobs = jobs[:args.limit]

    workers = max(1, (os.cpu_count() or 4) - 2)
    log(f'{len(jobs)}장을 워커 {workers}개로 처리')

    updates = {}
    manifest = []
    skipped = 0
    processed = 0

    with multiprocessing.Pool(processes=workers) as pool:
        for local_path, shift, byte_size, sha256 in pool.imap_unordered(worker, jobs, chunksize=8):
            processed += 1
            if shift is None:
                log(f'!! 보정 실패 {local_path}: {byte_size}')
            elif shift == 0.0:
                skipped += 1
            else:
                updates[local_path] = (byte_size, sha256)
                manifest.append({'local_path': local_path, 'shift_percent': round(shift, 3),
                                 'byte_size': byte_size, 'sha256': sha256})
            if processed % 200 == 0:
                elapsed = (time.time() - started) / 60
                log(f'  {processed}/{len(jobs)} 처리 · 보정 {len(updates)} · 변화없음 {skipped} · 경과 {elapsed:.1f}분')

    manifest.sort(key=lambda entry: entry['local_path'])
    log(f'보정 완료: 대상 {processed}장 중 {len(updates)}장 변경, {skipped}장은 이미 중앙')

    log('메타데이터 갱신 시작')
    counts = {
        'data/original_images.ndjson': rewrite_ndjson(os.path.join(TARGET, 'data', 'original_images.ndjson'), updates),
        'data/product_image_sets.ndjson': rewrite_ndjson(os.path.join(TARGET, 'data', 'product_image_sets.ndjson'), updates, nested_key='images'),
        'mysql/csv/original_images.csv': rewrite_csv(os.path.join(TARGET, 'mysql', 'csv', 'original_images.csv'), updates),
        'data/catalog.sqlite': rewrite_sqlite(os.path.join(TARGET, 'data', 'catalog.sqlite'), updates),
        'data/catalog.sqlite3': rewrite_sqlite(os.path.join(TARGET, 'data', 'catalog.sqlite3'), updates),
    }
    for name, count in counts.items():
        log(f'  {name}: {count}행 갱신')

    with open(os.path.join(TARGET, 'data', 'recenter_manifest.json'), 'w', encoding='utf-8') as handle:
        json.dump({
            'generated_at': time.strftime('%Y-%m-%dT%H:%M:%S%z'),
            'source': SOURCE,
            'algorithm': 'alpha-mass-centroid horizontal recentering',
            'shot_type': TARGET_SHOT_TYPE,
            'webp_quality': WEBP_QUALITY,
            'targets': processed,
            'changed': len(updates),
            'unchanged': skipped,
            'metadata_rows_updated': counts,
            'images': manifest,
        }, handle, ensure_ascii=False, indent=2)

    shifts = [entry['shift_percent'] for entry in manifest]
    with open(os.path.join(TARGET, 'RECENTER_HANDOFF.md'), 'w', encoding='utf-8') as handle:
        handle.write(f"""# 좌우 중심 보정 전달본

`{SOURCE}`를 그대로 복사한 뒤 **제품 컷의 좌우 중심만 보정**한 판본이다. 이 폴더 하나만 전달하면 된다.

## 무엇을 바꿨나

기존 파이프라인은 알파 bounding box를 기준으로 캔버스 중앙에 배치한다. 그런데 지퍼풀·스트랩처럼
얇고 길게 튀어나온 요소가 한쪽에 있으면 bbox 중심과 제품 본체의 시각적 중심이 어긋나 화면에서
제품이 한쪽으로 치우쳐 보인다. 그래서 **알파 질량 중심**(불투명도 가중 평균)을 캔버스 가운데로
옮겼다. 얇은 부속은 질량이 작아 중심을 거의 끌지 못하므로 본체 기준으로 정렬된다. 옮긴 뒤 캔버스를
벗어나면 그만큼 축소해 잘리지 않게 하고, 세로는 접지선 구도가 깨지므로 건드리지 않는다.

- 대상: `image_classifications.shot_type = 'product'` **{processed}장**
- 실제 변경: **{len(updates)}장** (나머지 {skipped}장은 이미 중앙이라 원본 그대로)
- 최대 이동량: {max(shifts, key=abs) if shifts else 0}% (캔버스 폭 대비)
- `model` 컷 858장은 인물 구도가 의도된 것이라 **건드리지 않았다**
- 재저장은 기존 변환과 같은 WebP quality {WEBP_QUALITY}, method 6, 알파 유지

## 백엔드가 알아야 할 것

- **파일 경로·이름·가로세로 픽셀 수는 그대로다.** 적재 코드는 바꿀 필요가 없다.
- 바뀐 이미지의 `byte_size`와 `sha256`은 아래 5곳에서 함께 갱신했다.
  `data/original_images.ndjson`, `data/product_image_sets.ndjson`,
  `mysql/csv/original_images.csv`, `data/catalog.sqlite`, `data/catalog.sqlite3`
- 장당 이동량과 새 해시는 `data/recenter_manifest.json`에 남겼다.
- 그 외 파일·스키마·행 수는 `{SOURCE}`와 동일하다.
""")

    log(f'RECENTER_HANDOFF.md · data/recenter_manifest.json 작성 완료')
    log(f'끝. 총 {(time.time() - started) / 60:.1f}분')


if __name__ == '__main__':
    sys.exit(main())
