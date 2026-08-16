"""번들 제품 누끼 컷의 좌우 중심을 자동 보정한다.

기존 파이프라인은 알파 bounding box 기준으로 가운데를 맞춘다. 그런데 지퍼풀·스트랩처럼
얇고 길게 튀어나온 요소가 한쪽에 있으면 bbox 중심과 제품 본체의 시각적 중심이 어긋나
화면에서 제품이 한쪽으로 치우쳐 보인다.

이 스크립트는 알파 질량 중심(불투명도 가중 평균)을 캔버스 가운데로 옮긴다. 얇은 부속은
질량이 작아 중심을 거의 끌지 못하므로 본체 기준으로 정렬된다. 캔버스를 벗어나면 그만큼
축소해 잘리지 않게 한다. 세로는 접지선 느낌이 깨지므로 건드리지 않는다.

번들 자산이 기본 대상이지만, 경로를 직접 넘기면 어떤 이미지 묶음에도 쓸 수 있다.
API로 전환할 때는 런타임이 아니라 이미지가 만들어지는 쪽(백엔드 이미지 파이프라인이나
CDN 업로드 전 단계)에서 같은 보정을 한 번 돌리는 것이 기준이다.

사용법:
    python3 tools/recenter-cutouts.py                      # 번들 자산 보정량만 출력 (dry-run)
    python3 tools/recenter-cutouts.py --apply              # 실제로 덮어쓰기
    python3 tools/recenter-cutouts.py --apply 'out/**/*.webp' ...   # 임의 경로에 적용
"""

import argparse
import glob
import os

import numpy as np
from PIL import Image

# 모델·라이프스타일 컷은 인물 구도가 의도된 것이라 제외하고 제품 컷만 보정한다.
TARGET_GLOBS = (
    'src/assets/mock/stark-primary/*.webp',
    'src/assets/mock/stark-colors/*.webp',
    'src/assets/mock/stark-visetos-detail-*.webp',
    'src/assets/mock/d2-recommendations/*-primary.webp',
    'src/assets/mock/d2-recommendations/*-detail-*.webp',
)
ALPHA_THRESHOLD = 8
WEBP_QUALITY = 82


def recenter(path: str, apply: bool) -> float:
    image = Image.open(path).convert('RGBA')
    canvas_w, canvas_h = image.size
    alpha = np.asarray(image.getchannel('A'), dtype=np.float32) / 255.0
    mask = alpha > (ALPHA_THRESHOLD / 255.0)
    if not mask.any():
        return 0.0

    columns = np.where(mask.any(axis=0))[0]
    rows = np.where(mask.any(axis=1))[0]
    left, right = int(columns[0]), int(columns[-1]) + 1
    top, bottom = int(rows[0]), int(rows[-1]) + 1

    weights = alpha[:, left:right].sum(axis=0)
    centroid_x = left + float((weights * np.arange(right - left)).sum() / weights.sum())
    shift = canvas_w / 2 - centroid_x
    if abs(shift) < 0.5:
        return 0.0

    content = image.crop((left, top, right, bottom))
    centroid_in_content = centroid_x - left
    # 질량 중심을 캔버스 가운데에 두면 좌우로 필요한 폭이 달라진다. 넘치면 그만큼 줄인다.
    half_span = max(centroid_in_content, content.width - centroid_in_content)
    scale = min(1.0, (canvas_w / 2) / half_span) if half_span > 0 else 1.0
    if scale < 1.0:
        content = content.resize(
            (max(1, round(content.width * scale)), max(1, round(content.height * scale))),
            Image.LANCZOS,
        )
        centroid_in_content *= scale

    sheet = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))
    x = round(canvas_w / 2 - centroid_in_content)
    y = round(top + (bottom - top - content.height) / 2)
    sheet.paste(content, (x, y), content)

    if apply:
        sheet.save(path, 'WEBP', quality=WEBP_QUALITY, method=6)

    return shift / canvas_w * 100


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--apply', action='store_true', help='결과를 파일에 덮어쓴다')
    parser.add_argument('globs', nargs='*', help='대상 경로 패턴. 생략하면 번들 제품 컷 전체')
    args = parser.parse_args()

    patterns = args.globs or TARGET_GLOBS
    paths = sorted({p for pattern in patterns for p in glob.glob(pattern, recursive=True)})
    for path in paths:
        moved = recenter(path, args.apply)
        print(f'{os.path.basename(path):40s} shift={moved:+.2f}%')
    print(f'\n{len(paths)}개 대상, {"적용" if args.apply else "dry-run"}')


if __name__ == '__main__':
    main()
