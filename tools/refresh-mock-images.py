"""final_final_tobackend의 보정본으로 프론트엔드 더미 이미지를 갱신한다.

중요: 알파 bbox 재크롭을 하지 않는다. 다시 크롭하면 질량 중심 보정이 bbox 중심으로 되돌아간다.
원본 캔버스를 그대로 축소만 하고, 각 asset의 현재 픽셀 크기를 유지해 화면 레이아웃을 건드리지 않는다.
모델 착장 컷은 보정 대상이 아니었으므로 교체하지 않는다.
"""
import glob
import os

from PIL import Image

SOURCE = 'final_final_tobackend/images_original'
QUALITY = 82

# asset 경로 ← (style_number, position)  — docs/MOCK_DATA.md의 매핑표와 같다.
ASSETS = {
    'src/assets/mock/stark-primary/stark-cognac-primary.webp': ('MMKEAVE15CO001', 1),
    'src/assets/mock/stark-primary/stark-black-primary.webp': ('MMKEAVE15BK001', 1),
    'src/assets/mock/stark-primary/stark-beige-primary.webp': ('MMKEAVE15IG001', 1),
    'src/assets/mock/stark-primary/stark-soft-pink-primary.webp': ('MMKEAVE15PZ001', 1),
    'src/assets/mock/stark-primary/stark-white-primary.webp': ('MMKEAVE15WT001', 1),
    'src/assets/mock/stark-primary/stark-cinnamon-primary.webp': ('MMKGSVE034B001', 1),
    'src/assets/mock/stark-visetos-detail-02-new.webp': ('MMKEAVE15CO001', 2),
    'src/assets/mock/stark-visetos-detail-03-new.webp': ('MMKEAVE15CO001', 5),
    'src/assets/mock/stark-visetos-detail-04-new.webp': ('MMKEAVE15CO001', 4),
    'src/assets/mock/stark-colors/stark-black-detail-02.webp': ('MMKEAVE15BK001', 2),
    'src/assets/mock/stark-colors/stark-black-detail-04.webp': ('MMKEAVE15BK001', 4),
    'src/assets/mock/stark-colors/stark-white-detail-02.webp': ('MMKEAVE15WT001', 2),
    'src/assets/mock/stark-colors/stark-white-detail-04.webp': ('MMKEAVE15WT001', 4),
    'src/assets/mock/d2-recommendations/ottomar-travel-pouch-primary.webp': ('MXZFSTT03CO001', 1),
    'src/assets/mock/d2-recommendations/ottomar-travel-pouch-detail-02.webp': ('MXZFSTT03CO001', 2),
    'src/assets/mock/d2-recommendations/ottomar-travel-pouch-detail-03.webp': ('MXZFSTT03CO001', 3),
    'src/assets/mock/d2-recommendations/ottomar-weekender-primary.webp': ('MMVGATT01CO001', 1),
    'src/assets/mock/d2-recommendations/ottomar-weekender-detail-02.webp': ('MMVGATT01CO001', 2),
    'src/assets/mock/d2-recommendations/ottomar-weekender-detail-03.webp': ('MMVGATT01CO001', 3),
    'src/assets/mock/d2-recommendations/ottomar-weekender-detail-04.webp': ('MMVGATT01CO001', 4),
    'src/assets/mock/d2-recommendations/ottomar-trolley-primary.webp': ('MMVDSTT02CO001', 1),
    'src/assets/mock/d2-recommendations/ottomar-trolley-detail-02.webp': ('MMVDSTT02CO001', 2),
    'src/assets/mock/d2-recommendations/ottomar-trolley-detail-03.webp': ('MMVDSTT02CO001', 3),
    'src/assets/mock/d2-recommendations/ottomar-trolley-detail-04.webp': ('MMVDSTT02CO001', 4),
}


def source_path(style_number: str, position: int) -> str:
    hits = glob.glob(f'{SOURCE}/{style_number}/{position:02d}-*.webp')
    if not hits:
        raise SystemExit(f'원본 없음: {style_number} pos{position}')
    return hits[0]


def main() -> None:
    for asset, (style_number, position) in ASSETS.items():
        target_size = Image.open(asset).size
        image = Image.open(source_path(style_number, position)).convert('RGBA')
        before = os.path.getsize(asset)
        image.resize(target_size, Image.LANCZOS).save(asset, 'WEBP', quality=QUALITY, method=6)
        print(f'{os.path.basename(asset):44s} {style_number} pos{position} '
              f'{target_size[0]}×{target_size[1]}  {before // 1024}KB → {os.path.getsize(asset) // 1024}KB')
    print(f'\n{len(ASSETS)}개 교체 완료 (모델 착장 컷은 보정 대상이 아니라 유지)')


if __name__ == '__main__':
    main()
