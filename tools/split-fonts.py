#!/usr/bin/env python3
"""Pretendard woff2 를 unicode-range 별로 쪼갠다.

전체 Pretendard 는 한 굵기당 760KB 다. 코드포인트 14,336 자 중 11,172 자가
한글 음절(AC00-D7A3)이고, 용량 대부분도 거기서 나온다. 화면에 실제로 그려지는
글자는 그중 일부뿐인데 지금은 항상 전부 받는다.

글리프를 버리지 않고 여러 파일로 나눈 뒤 @font-face 에 unicode-range 를 달면
브라우저가 그 페이지에 필요한 조각만 받는다. 렌더링 결과는 이전과 같다.

조각 나누는 기준:
  base   한글 음절이 아닌 전부 (라틴·기호·자모·가나·키릴 …)
  ko-app 앱 소스에 직접 박혀 있는 한글 — 첫 화면에 거의 확실히 필요하다
  ko-common  나머지 KS X 1001 상용 음절 2,350 자 — 닉네임·상품명 등 서버 문자열이 여기 든다
  ko-rare    그 밖의 희귀 음절 — 거의 받지 않는다

사용법:  python3 tools/split-fonts.py
출력  :  src/assets/fonts/pretendard/*.woff2 + src/assets/fonts/pretendard.css
"""

from __future__ import annotations

import re
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

REPO = Path(__file__).resolve().parent.parent
FONT_DIR = REPO / 'src' / 'assets' / 'fonts'
OUT_DIR = FONT_DIR / 'pretendard'
CSS_PATH = FONT_DIR / 'pretendard.css'

SOURCES = [
    ('Pretendard-Medium.woff2', 500),
    ('Pretendard-SemiBold.woff2', 600),
]

HANGUL_FIRST, HANGUL_LAST = 0xAC00, 0xD7A3
HANGUL_RE = re.compile(r'[가-힣]')

# 어느 화면에나 한 글자는 나오는 구간. 이 조각은 사실상 항상 받는다.
LATIN_RANGES = [
    (0x0000, 0x024F),  # 기본 라틴 + 라틴-1 + 확장 A/B
    (0x2000, 0x206F),  # 일반 구두점 (…, –, ' ' " ")
    (0x20A0, 0x20BF),  # 통화 기호 (₩, €)
    (0x2122, 0x2122),  # ™
    (0x00AE, 0x00AE),  # ®
]

# 한국어 본문에 섞여 나오는 기호. 라틴만큼 잦지는 않다.
SYMBOL_RANGES = [
    (0x3000, 0x303F),  # CJK 구두점
    (0x3130, 0x318F),  # 호환 자모 (ㄱ, ㅏ)
    (0xFF00, 0xFFEF),  # 전각
    (0x2190, 0x21FF),  # 화살표
    (0x2500, 0x25FF),  # 괘선 + 기하 도형
    (0x2600, 0x26FF),  # 기타 기호
]


def in_ranges(code: int, ranges: list[tuple[int, int]]) -> bool:
    return any(low <= code <= high for low, high in ranges)
SCAN_SUFFIXES = {'.ts', '.tsx', '.css', '.html'}
SCAN_ROOTS = [REPO / 'src', REPO / 'index.html']


def app_hangul() -> set[int]:
    """앱 소스에 직접 적혀 있는 한글 음절."""
    found: set[int] = set()
    for root in SCAN_ROOTS:
        paths = [root] if root.is_file() else [
            p for p in root.rglob('*') if p.is_file() and p.suffix in SCAN_SUFFIXES
        ]
        for path in paths:
            text = path.read_text(encoding='utf-8', errors='ignore')
            found.update(ord(ch) for ch in HANGUL_RE.findall(text))
    return found


def ksx1001_hangul() -> set[int]:
    """KS X 1001 상용 음절 2,350 자.

    파이썬의 euc_kr 코덱은 실제로는 확장분(UHC)까지 받아 11,172 자가 전부 통과한다.
    KS X 1001 본래 영역은 두 바이트가 모두 0xA1..0xFE 인 것들이라 그것으로 가른다.
    """
    common: set[int] = set()
    for code in range(HANGUL_FIRST, HANGUL_LAST + 1):
        try:
            encoded = chr(code).encode('euc-kr')
        except UnicodeEncodeError:
            continue
        if len(encoded) == 2 and all(0xA1 <= byte <= 0xFE for byte in encoded):
            common.add(code)
    return common


def unicode_range(codepoints: set[int]) -> str:
    """코드포인트 집합을 CSS unicode-range 문자열로 압축한다."""
    parts: list[str] = []
    for code in sorted(codepoints):
        if parts:
            start, _, end = parts[-1].partition('-')
            last = int(end or start, 16)
            if code == last + 1:
                parts[-1] = f'{start}-{code:X}'
                continue
        parts.append(f'{code:X}')
    return ', '.join(f'U+{p}' for p in parts)


def build_slice(source: Path, codepoints: set[int], destination: Path) -> int:
    font = TTFont(source)
    options = subset.Options()
    # 렌더링이 달라지지 않도록 레이아웃 기능과 힌팅을 모두 남긴다.
    options.layout_features = ['*']
    options.name_IDs = ['*']
    options.notdef_outline = True
    options.recalc_bounds = True
    options.drop_tables = []
    options.hinting = True
    options.desubroutinize = False

    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=codepoints)
    subsetter.subset(font)

    font.flavor = 'woff2'
    destination.parent.mkdir(parents=True, exist_ok=True)
    font.save(destination)
    font.close()
    return destination.stat().st_size


def main() -> None:
    in_app = app_hangul()
    common = ksx1001_hangul()

    for path in OUT_DIR.glob('*.woff2'):
        path.unlink()

    css: list[str] = [
        '/* tools/split-fonts.py 가 생성한다. 직접 고치지 말 것. */',
        '',
    ]
    grand_before = grand_after = 0

    for filename, weight in SOURCES:
        source = FONT_DIR / filename
        covered = set(TTFont(source).getBestCmap())

        hangul = {c for c in covered if HANGUL_FIRST <= c <= HANGUL_LAST}
        non_hangul = covered - hangul
        latin = {c for c in non_hangul if in_ranges(c, LATIN_RANGES)}
        symbols = {c for c in non_hangul if in_ranges(c, SYMBOL_RANGES)} - latin

        tiers = {
            'latin': latin,
            'symbols': symbols,
            'other': non_hangul - latin - symbols,
            'ko-app': hangul & in_app,
            'ko-common': (hangul & common) - in_app,
            'ko-rare': hangul - common - in_app,
        }

        before = source.stat().st_size
        grand_before += before
        print(f'{filename}  {before / 1024:.0f} KB')

        for tier, codepoints in tiers.items():
            if not codepoints:
                continue
            out_name = f'Pretendard-{weight}.{tier}.woff2'
            size = build_slice(source, codepoints, OUT_DIR / out_name)
            grand_after += size
            print(f'   {tier:<10} {len(codepoints):>6} 자  {size / 1024:>7.0f} KB')

            css += [
                '@font-face {',
                "  font-family: 'Pretendard';",
                f"  src: url('./pretendard/{out_name}') format('woff2');",
                f'  font-weight: {weight};',
                '  font-style: normal;',
                '  font-display: swap;',
                f'  unicode-range: {unicode_range(codepoints)};',
                '}',
                '',
            ]

    CSS_PATH.write_text('\n'.join(css), encoding='utf-8')
    print(f'\n합계  {grand_before / 1024:.0f} KB -> {grand_after / 1024:.0f} KB (전체 조각 합)')
    print(f'생성  {CSS_PATH.relative_to(REPO)}')


if __name__ == '__main__':
    main()
