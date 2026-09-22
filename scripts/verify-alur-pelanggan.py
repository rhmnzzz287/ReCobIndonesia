#!/usr/bin/env python3
"""
Verifikasi geometri Docs/alur-pelanggan.html tanpa peramban.

Memeriksa hal yang tidak terlihat mata pada tangkapan layar:
  1. setiap rect simpul berada di dalam kartu tahapnya
  2. tidak ada simpul yang saling tumpang tindih
  3. semua teks berada di dalam simpulnya (perkiraan lebar aksara)
  4. label tahap tidak melampaui chip
  5. jumlah simpul per tahap sesuai harapan
  6. tidak ada emoji dan tidak ada karakter di luar Latin-1 modern
"""
import html
import re
import sys
import unicodedata
from pathlib import Path

PATH = Path("Docs/alur-pelanggan.html")
if not PATH.exists():
    # verifier boleh dijalankan dari akar repo mana pun
    PATH = Path(__file__).resolve().parent.parent / "Docs" / "alur-pelanggan.html"
src = PATH.read_text(encoding="utf-8")

fail: list[str] = []


def check(cond: bool, msg: str) -> None:
    if not cond:
        fail.append(msg)


# --- 1. struktur dasar -------------------------------------------------------
check(src.count("<svg") == 1, "harus tepat satu svg")
check(src.count("</svg>") == 1, "svg tidak tertutup")

rects = [
    (float(m.group(1)), float(m.group(2)), float(m.group(3)), float(m.group(4)))
    for m in re.finditer(
        r'<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"', src
    )
]
cards = [r for r in rects if abs(r[2] - 1066.0) < 0.01 and r[3] > 100]
CHIP_W_EXPECTED = 188.0
chips = [r for r in rects if abs(r[2] - CHIP_W_EXPECTED) < 0.01 and abs(r[3] - 62.0) < 0.01]
check(len(cards) == 7, f"kartu tahap harus 7, dapat {len(cards)}")
check(len(chips) == 7, f"chip tahap harus 7, dapat {len(chips)}")

# simpul: rect dengan lebar 2 atau 3 kolom, tinggi 66
nodes = [r for r in rects if abs(r[3] - 66.0) < 0.01 and r[2] > 200]
expected_nodes = [2, 9, 4, 6, 6, 6, 4]
check(len(nodes) == sum(expected_nodes), f"simpul harus {sum(expected_nodes)}, dapat {len(nodes)}")

# --- 2. simpul di dalam kartu -----------------------------------------------
card_boxes = sorted(cards, key=lambda r: r[1])
for i, (cx, cy, cw, ch) in enumerate(card_boxes, start=1):
    inner = [n for n in nodes if cy <= n[1] < cy + ch]
    check(
        len(inner) == expected_nodes[i - 1],
        f"tahap {i}: simpul harus {expected_nodes[i-1]}, dapat {len(inner)}",
    )
    for nx, ny, nw, nh in inner:
        check(nx >= cx, f"tahap {i}: simpul x={nx} keluar kiri kartu x={cx}")
        check(nx + nw <= cx + cw + 0.5, f"tahap {i}: simpul kanan {nx+nw} lewat {cx+cw}")
        check(ny >= cy, f"tahap {i}: simpul y={ny} di atas kartu y={cy}")
        check(ny + nh <= cy + ch + 0.5, f"tahap {i}: simpul bawah {ny+nh} lewat {cy+ch}")

# --- 3. tidak ada tumpang tindih antar simpul -------------------------------
for i in range(len(nodes)):
    for j in range(i + 1, len(nodes)):
        ax, ay, aw, ah = nodes[i]
        bx, by, bw, bh = nodes[j]
        overlap = ax < bx + bw and bx < ax + aw and ay < by + bh and by < ay + ah
        check(not overlap, f"simpul tumpang tindih: {(ax,ay)} vs {(bx,by)}")

# --- 4. teks muat di dalam simpulnya ---------------------------------------
# Perkiraan lebar aksara untuk Rubik/Plus Jakarta Sans pada ukuran kecil.
WIDE = set("mwMW@%&")
NARROW = set("iljItfr.,:;'|!()[]")


def text_width(s: str, size: float, bold: bool) -> float:
    total = 0.0
    for ch in s:
        if ch in WIDE:
            factor = 0.92
        elif ch in NARROW:
            factor = 0.34
        elif ch == " ":
            factor = 0.27
        elif ch.isupper() or ch.isdigit():
            factor = 0.60
        else:
            factor = 0.535
        total += factor * size
    return total * (1.04 if bold else 1.0)


node_texts = re.findall(
    r'<text x="([\d.]+)" y="([\d.]+)" font-size="(12\.5|10\.5)"'
    r'(?: font-weight="(\d+)")? fill="[^"]*"(?: opacity="[\d.]+")?>([^<]*)</text>',
    src,
)
check(len(node_texts) >= 2 * len(nodes), f"teks simpul kurang: {len(node_texts)}")

# pasangkan tiap teks ke simpul yang memuatnya
for tx, ty, size, weight, text in node_texts:
    tx, ty, size = float(tx), float(ty), float(size)
    for nx, ny, nw, nh in nodes:
        if nx <= tx <= nx + nw and ny <= ty <= ny + nh:
            avail = nw - (tx - nx) - 10  # sisa ruang sampai tepi kanan, beri margin
            need = text_width(text, size, weight == "600")
            check(
                need <= avail,
                f"teks meluber ({need:.0f}px > {avail:.0f}px) di simpul w={nw:.0f}: {text!r}",
            )
            break

# --- 5. label tahap muat di chip -------------------------------------------
chip_texts = re.findall(r'font-size="15\.5" font-weight="700" fill="#FFFFFF">([^<]*)<', src)
check(len(chip_texts) == 7, f"label chip harus 7, dapat {len(chip_texts)}")
for t in chip_texts:
    plain = html.unescape(t)
    need = text_width(plain, 15.5, True)
    check(need <= CHIP_W_EXPECTED - 22, f"label chip meluber ({need:.0f}px): {plain!r}")

# --- 6. higienis: tanpa emoji, tanpa karakter aneh -------------------------
check("\u2192" in src, "panah teks hilang (diharapkan ada di tahap 1)")
emoji_like = [c for c in src if unicodedata.category(c) == "So"]
check(not emoji_like, f"ada karakter simbol/emoji: {emoji_like[:5]}")

print(f"berkas      : {PATH} ({len(src):,} byte)")
print(f"kartu tahap : {len(cards)}")
print(f"simpul      : {len(nodes)} (harapan {sum(expected_nodes)})")
print(f"teks diperiksa: {len(node_texts)} simpul + {len(chip_texts)} chip")
print()
if fail:
    print(f"GAGAL - {len(fail)} temuan:")
    for f in fail[:25]:
        print(f"  - {f}")
    sys.exit(1)
print("LULUS - geometri, muat teks, dan higienis bersih")
