#!/usr/bin/env python3
"""
Generator flowchart alur pelanggan ReCob.id -> Docs/alur-pelanggan.html

Seluruh simpul diturunkan dari kode dan probe nyata:
  rute            apps/web/app/{produk,kalkulator,mitra,edukasi,kontak}/page.tsx
  urutan beranda  apps/web/app/page.tsx:73-81
  tautan          grep href di apps/web/components/** + content/copy/id.ts:390-397
  titik konversi  hitungan a href="/kontak#form-sampel" per halaman (probe)
  form            apps/web/components/blocks/sample-form.tsx
  jalur server    apps/web/app/actions/submit-lead.ts
  jembatan sapi   apps/web/lib/utils/cattle-prefill.ts
  nama event      packages/shared/src/constants/funnel-events.ts
  kerangka fase   Docs/PRD.md:145-165 (Bagian 6)
"""

import html
from pathlib import Path

W = 1320
CHIP_X, CHIP_W = 30, 188
CARD_X, CARD_W = 224, 1066
PAD = 24
INNER_X = CARD_X + PAD
INNER_W = CARD_W - 2 * PAD
TOP = 100
GAP = 46
NODE_H = 66
ROW_GAP = 12
COL_GAP = 14
SUB_H = 24
SUB_GAP = 12

# kind -> (fill, stroke, ink, bar)
KIND = {
    "route":  ("#E7F1E4", "#0B6E3B", "#084F2A", "#0B6E3B"),
    "event":  ("#FFF8EE", "#EDC22E", "#7A5C12", "#EDC22E"),
    "action": ("#0B6E3B", "#084F2A", "#FFFFFF", "#7DBE35"),
    "server": ("#123326", "#123326", "#E7F1E4", "#7DBE35"),
    "plain":  ("#F4F8F0", "#DDEBD2", "#1F2A24", "#C7DCB8"),
    "warn":   ("#FFF3D1", "#EDC22E", "#7A5C12", "#EDC22E"),
}

STAGES = [
    dict(
        n=1, title="Kesadaran", sub="Kanal luar membawa pengunjung masuk; atribusi memakai utm tanpa data pribadi",
        nodes=[
            ("TikTok, Instagram, Facebook, WhatsApp", "tautan bio menuju beranda", "plain"),
            ("utm_source \u2192 page_view", "nama event tetap lintas fase", "event"),
        ],
    ),
    dict(
        n=2, title="Pertimbangan", sub="Beranda / \u2014 sembilan bagian berurutan (page.tsx:73\u201381)",
        nodes=[
            ("Hero", "2 ajakan + jangkar harga", "plain"),
            ("Garis Dampak", "3 angka ringkas", "plain"),
            ("Masalah", "3 kartu keluhan", "plain"),
            ("Solusi", "3 pilar", "plain"),
            ("Produk Ringkas", "menuju /produk", "route"),
            ("Kisi Tautan", "4 rute sekunder", "route"),
            ("Kendali Mutu", "3 kartu bukti", "plain"),
            ("FAQ", "akordeon tanya-jawab", "plain"),
            ("Cta Akhir", "formulir sampel", "action"),
        ],
    ),
    dict(
        n=3, title="Eksplorasi", sub="Empat rute sekunder, semuanya terdaftar di sitemap.ts:11\u201316",
        nodes=[
            ("/produk", "3 bahan, karung 50 kg, Rp160.000", "route"),
            ("/kalkulator", "tabel statis + kalkulator 3 asumsi", "route"),
            ("/mitra", "4 langkah potong setoran susu", "route"),
            ("/edukasi", "4 panduan kandang", "route"),
        ],
    ),
    dict(
        n=4, title="Aksi & Interaksi", sub="Angka dapat diuji sendiri; masukan di luar rentang ditolak, bukan dihitung",
        nodes=[
            ("3 asumsi pengunjung", "jumlah sapi, harga pakan, asupan harian", "plain"),
            ("Harga ReCob.id dari data", "calculator.tsx:37 membaca product.priceIdr", "plain"),
            ("4 nilai hasil", "bulan, tahun, per ekor, persentase", "plain"),
            ("Rentang ditolak", "harga pakan Rp50.000\u2013Rp1.000.000", "warn"),
            ("Validasi form", "4 kolom wajib, 2 opsional, persetujuan", "warn"),
            ("Honeypot", "kolom tersembunyi dijawab seolah sukses", "warn"),
        ],
    ),
    dict(
        n=5, title="Titik Konversi", sub="Lima pintu menuju satu formulir di /kontak#form-sampel",
        nodes=[
            ("Header, semua halaman", "Klaim Sampel Gratis 2-3 kg", "action"),
            ("Hero + Cta akhir", "di beranda", "action"),
            ("Bilah lengket", "muncul setelah 640 px", "action"),
            ("Kalkulator", "membawa jumlah sapi terisi", "action"),
            ("Formulir sampel", "8 kolom termasuk honeypot", "route"),
            ("sample_form_submit", "peristiwa kirim", "event"),
        ],
    ),
    dict(
        n=6, title="Pemrosesan", sub="Server Action: honeypot \u2192 validasi ketat \u2192 batas laju \u2192 simpan",
        nodes=[
            ("submitLeadAction", "honeypot diperiksa paling awal", "server"),
            ("Skema .strict()", "kolom di luar kontrak ditolak", "server"),
            ("checkRateLimit", "kunci dari x-forwarded-for", "server"),
            ("Supabase + RLS", "kode 23505 = duplikat WhatsApp", "server"),
            ("Notifikasi internal", "HMAC-SHA256, gagal tidak menggagalkan lead", "server"),
            ("lead_created / duplicate", "dua keadaan sukses terpisah", "event"),
        ],
    ),
    dict(
        n=7, title="Tindak Lanjut", sub="Tim lapangan menghubungi, lalu jalur kemitraan koperasi",
        nodes=[
            ("Tim lapangan menghubungi", "lewat WhatsApp yang diisi", "plain"),
            ("Sampel 2\u20133 kg + panduan", "panduan takaran hari 1\u20137", "plain"),
            ("/mitra: potong setoran", "tagihan dipotong dari slip susu mingguan", "route"),
            ("Phase 2: portal peternak", "di luar lingkup prototype", "plain"),
        ],
    ),
]

# Probe terukur pada dev server
NAV_TRAIL = ["/", "/produk", "/kalkulator", "/mitra", "/edukasi", "/kontak"]
CTA_COUNTS = [
    ("/", 5, 1), ("/produk", 4, 0), ("/kalkulator", 5, 1),
    ("/mitra", 4, 0), ("/edukasi", 4, 0), ("/kontak", 4, 0),
]


def esc(s: str) -> str:
    return html.escape(s, quote=True)


def layout():
    y = TOP
    out = []
    for st in STAGES:
        nodes = st["nodes"]
        cols = 3 if len(nodes) > 4 else 2
        rows = (len(nodes) + cols - 1) // cols
        card_h = PAD + SUB_H + SUB_GAP + rows * NODE_H + (rows - 1) * ROW_GAP + PAD
        nw = (INNER_W - (cols - 1) * COL_GAP) / cols
        placed = []
        for i, (label, note, kind) in enumerate(nodes):
            r, c = divmod(i, cols)
            x = INNER_X + c * (nw + COL_GAP)
            ny = y + PAD + SUB_H + SUB_GAP + r * (NODE_H + ROW_GAP)
            placed.append(dict(x=x, y=ny, w=nw, h=NODE_H, label=label, note=note, kind=kind))
        out.append(dict(n=st["n"], title=st["title"], sub=st["sub"], y=y, card_h=card_h, nodes=placed))
        y += card_h + GAP
    return out, y - GAP + 44


def render_svg(stages, height) -> str:
    p = [
        f'<svg viewBox="0 0 {W} {height:.0f}" width="100%" role="img" '
        f'preserveAspectRatio="xMidYMin meet" aria-labelledby="flow-title flow-desc" '
        f'xmlns="http://www.w3.org/2000/svg">',
        '<title id="flow-title">Alur pelanggan utama ReCob.id</title>',
        '<desc id="flow-desc">Tujuh tahap alur pelanggan: kesadaran, pertimbangan, '
        'eksplorasi, aksi dan interaksi, titik konversi, pemrosesan server, tindak lanjut.</desc>',
        '<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" '
        'markerHeight="7" orient="auto-start-reverse">'
        '<path d="M 0 0 L 10 5 L 0 10 z" fill="#0B6E3B"/></marker></defs>',
    ]

    # panah antar tahap digambar lebih dulu agar berada di belakang kartu
    for a, b in zip(stages, stages[1:]):
        x = CARD_X + CARD_W / 2
        p.append(
            f'<line x1="{x:.0f}" y1="{a["y"] + a["card_h"] + 7:.0f}" x2="{x:.0f}" '
            f'y2="{b["y"] - 9:.0f}" stroke="#0B6E3B" stroke-width="2" marker-end="url(#arrow)"/>'
        )

    for st in stages:
        y, h = st["y"], st["card_h"]
        p.append(
            f'<rect x="{CARD_X}" y="{y}" width="{CARD_W}" height="{h:.0f}" rx="14" '
            f'fill="#FFFFFF" stroke="#DDEBD2" stroke-width="1.5"/>'
        )
        p.append(
            f'<rect x="{CHIP_X}" y="{y + 8}" width="{CHIP_W}" height="62" rx="10" fill="#0B6E3B"/>'
        )
        p.append(
            f'<text x="{CHIP_X + CHIP_W / 2}" y="{y + 31}" text-anchor="middle" font-size="10.5" '
            f'letter-spacing="1.5" fill="#B9E6A0">TAHAP {st["n"]}</text>'
        )
        p.append(
            f'<text x="{CHIP_X + CHIP_W / 2}" y="{y + 53}" text-anchor="middle" font-size="15.5" '
            f'font-weight="700" fill="#FFFFFF">{esc(st["title"])}</text>'
        )
        p.append(
            f'<text x="{INNER_X}" y="{y + PAD + 16}" font-size="12.5" fill="#4A5A52">'
            f'{esc(st["sub"])}</text>'
        )
        for nd in st["nodes"]:
            fill, stroke, ink, bar = KIND[nd["kind"]]
            p.append(
                f'<rect x="{nd["x"]:.1f}" y="{nd["y"]:.1f}" width="{nd["w"]:.1f}" '
                f'height="{nd["h"]}" rx="9" fill="{fill}" stroke="{stroke}" stroke-width="1.5"/>'
            )
            p.append(
                f'<rect x="{nd["x"]:.1f}" y="{nd["y"] + 1:.1f}" width="4" height="{nd["h"] - 2}" '
                f'rx="2" fill="{bar}"/>'
            )
            cx = nd["x"] + 17
            p.append(
                f'<text x="{cx:.1f}" y="{nd["y"] + 28:.1f}" font-size="12.5" font-weight="600" '
                f'fill="{ink}">{esc(nd["label"])}</text>'
            )
            p.append(
                f'<text x="{cx:.1f}" y="{nd["y"] + 47:.1f}" font-size="10.5" fill="{ink}" '
                f'opacity="0.74">{esc(nd["note"])}</text>'
            )
    p.append("</svg>")
    return "\n".join(p)


def render_legend() -> str:
    items = [
        ("route", "Rute halaman", "punya alamat, judul, dan kanonik sendiri"),
        ("action", "Titik konversi", "tautan menuju formulir sampel"),
        ("plain", "Seksi / langkah", "bagian di dalam halaman"),
        ("event", "Peristiwa analitik", "nama tetap dari funnel-events.ts"),
        ("server", "Proses server", "Server Action dan basis data"),
        ("warn", "Batas / validasi", "masukan di luar rentang ditolak"),
    ]
    out = []
    for kind, name, desc in items:
        fill, stroke, _ink, bar = KIND[kind]
        out.append(
            f'<li><span class="swatch" style="background:{fill};border-color:{stroke}">'
            f'<i style="background:{bar}"></i></span><b>{esc(name)}</b>'
            f'<span class="muted">{esc(desc)}</span></li>'
        )
    return "\n".join(out)


def main() -> None:
    import sys

    stages, height = layout()
    svg = render_svg(stages, height)

    cta_rows = "\n".join(
        f'<tr><td class="mono">{esc(r)}</td><td class="num">{t}</td>'
        f'<td class="num{" zero" if m == 0 else ""}">{m}</td></tr>'
        for r, t, m in CTA_COUNTS
    )
    trail = ' <span class="arrow">&rarr;</span> '.join(f"<code>{esc(s)}</code>" for s in NAV_TRAIL)

    css = """
  :root {
    --surface:#FFFFFF; --paper:#F4F8F0; --ink:#0D1216; --ink-deep:#123326;
    --primary:#0B6E3B; --primary-strong:#084F2A; --primary-soft:#E7F1E4;
    --accent:#7DBE35; --border:#DDEBD2; --text:#1F2A24; --text-secondary:#4A5A52;
    --corn:#EDC22E;
  }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--paper); color:var(--text); line-height:1.6;
    font-family:"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif; }
  .wrap { max-width:1460px; margin:0 auto; padding:44px 26px 68px; }
  header.top { border-bottom:1px solid var(--border); padding-bottom:26px; margin-bottom:34px; }
  .eyebrow { font-size:12px; letter-spacing:.13em; text-transform:uppercase;
    color:var(--primary); font-weight:600; margin:0 0 10px; }
  h1 { font-family:Rubik, ui-sans-serif, sans-serif; font-weight:800; font-size:42px;
    line-height:1.08; letter-spacing:-.02em; color:var(--ink); margin:0; }
  .lede { margin:15px 0 0; max-width:80ch; color:var(--text-secondary); }
  .criterion { display:inline-flex; align-items:center; gap:10px; margin-top:22px;
    background:var(--primary-soft); border:1px solid var(--border); border-radius:999px;
    padding:9px 18px; font-size:13px; color:var(--primary-strong); }
  .criterion b { font-weight:600; }
  .criterion code { font-size:12.5px; }
  .panel { background:var(--surface); border:1px solid var(--border); border-radius:18px;
    padding:30px; margin-bottom:30px; }
  .panel > h2 { font-family:Rubik, sans-serif; font-size:20px; font-weight:700;
    color:var(--ink); margin:0 0 7px; }
  .panel > p.hint { margin:0 0 24px; color:var(--text-secondary); font-size:13.5px; }
  /* Diagram punya lebar tetap 1320px agar tipografinya tetap terbaca.
     Di layar sempit ia digulir mendatar, bukan diperkecil sampai tak terbaca. */
  .canvas { overflow-x:auto; -webkit-overflow-scrolling:touch;
    border-radius:12px; }
  .canvas > svg { display:block; height:auto; min-width:1320px; }
  .scroll-hint { display:none; margin:14px 0 0; font-size:12.5px; color:var(--text-secondary); }
  @media (max-width:1400px) { .scroll-hint { display:block; } }
  .legend { list-style:none; padding:0; margin:26px 0 0; display:grid;
    grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:13px 24px; }
  .legend li { display:flex; align-items:center; gap:10px; font-size:13px; }
  .legend b { font-weight:600; color:var(--ink); }
  .legend .muted { color:var(--text-secondary); font-size:12px; }
  .swatch { width:26px; height:16px; border-radius:4px; border:1.5px solid;
    display:inline-flex; align-items:center; flex:0 0 auto; }
  .swatch i { display:block; width:3px; height:16px; border-radius:2px; }
  .cards { display:grid; grid-template-columns:repeat(auto-fit, minmax(330px, 1fr)); gap:22px; }
  .card { background:var(--surface); border:1px solid var(--border); border-radius:16px;
    padding:26px; }
  .card h3 { font-family:Rubik, sans-serif; font-size:15px; font-weight:700; margin:0 0 15px;
    color:var(--ink); }
  .card .kdot { display:inline-block; width:9px; height:9px; border-radius:50%;
    background:var(--accent); margin-right:9px; vertical-align:middle; }
  .card.gap { border-color:var(--corn); background:#FFFDF6; }
  .card.gap .kdot { background:var(--corn); }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  th, td { text-align:left; padding:8px 0; border-bottom:1px solid var(--border); }
  th { font-size:11px; letter-spacing:.08em; text-transform:uppercase;
    color:var(--text-secondary); font-weight:600; }
  td.num { text-align:right; font-family:"IBM Plex Mono", monospace; }
  td.num.zero { color:var(--text-secondary); }
  .trail { font-size:13px; line-height:2.5; }
  .trail .arrow { color:var(--primary); font-weight:600; }
  ul.plain { margin:0; padding-left:20px; font-size:13px; color:var(--text-secondary); }
  ul.plain li { margin-bottom:8px; }
  ul.plain b { color:var(--ink); font-weight:600; }
  code, td.mono { font-family:"IBM Plex Mono", monospace; font-size:12.5px; }
  code { background:var(--paper); border:1px solid var(--border); border-radius:5px;
    padding:2px 6px; color:var(--primary-strong); }
  .tag { display:inline-block; font-size:11px; letter-spacing:.06em; text-transform:uppercase;
    font-weight:600; border-radius:999px; padding:3px 11px; margin-bottom:12px; }
  .tag.ok { background:var(--primary-soft); color:var(--primary-strong); }
  .tag.gap { background:#FFF3D1; color:#7A5C12; }
  footer.bot { margin-top:36px; padding-top:22px; border-top:1px solid var(--border);
    font-size:12px; color:var(--text-secondary); line-height:1.9; }
  @media print { body { background:#fff; } .panel, .card { break-inside:avoid; } }
"""

    doc = f"""<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Alur Pelanggan Utama &mdash; ReCob.id</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&family=Rubik:wght@500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>{css}</style>
</head>
<body>
<div class="wrap">
  <header class="top">
    <p class="eyebrow">ReCob.id &mdash; Artefak Kriteria Penerimaan Prototipe</p>
    <h1>Alur Pelanggan Utama</h1>
    <p class="lede">
      Alur dari kanal perolehan sampai tindak lanjut lapangan pada prototipe enam halaman.
      Setiap simpul dilacak ke berkas sumbernya dan setiap angka berasal dari probe pada
      peramban sungguhan, bukan perkiraan. Kerangka tahap mengikuti
      <code>Docs/PRD.md</code> Bagian 6.
    </p>
    <p class="criterion"><b>Kriteria:</b> <code>Show the main customer flow</code></p>
  </header>

  <section class="panel">
    <h2>Peta Alur</h2>
    <p class="hint">Tujuh tahap berurutan. Panah menunjukkan perpindahan pengunjung, bukan pemanggilan jaringan.</p>
    <div class="canvas">
{svg}
    </div>
    <p class="scroll-hint">Diagram dapat digulir mendatar pada layar sempit.</p>
    <ul class="legend">
      {render_legend()}
    </ul>
  </section>

  <section class="panel">
    <h2>Bukti Terukur</h2>
    <p class="hint">Diambil dari peramban pada enam rute yang berjalan.</p>
    <div class="cards">
      <div class="card">
        <h3><span class="kdot"></span>Jejak Navigasi</h3>
        <p class="trail">{trail}</p>
        <p style="font-size:12.5px;color:var(--text-secondary);margin:14px 0 0">
          Menu utama diklik berurutan; setiap perpindahan mengubah alamat peramban.
        </p>
      </div>

      <div class="card">
        <h3><span class="kdot"></span>Titik Konversi per Halaman</h3>
        <table>
          <thead><tr><th>Halaman</th><th style="text-align:right">Tautan</th>
          <th style="text-align:right">Dalam konten</th></tr></thead>
          <tbody>
{cta_rows}
          </tbody>
        </table>
        <p style="font-size:12.5px;color:var(--text-secondary);margin:14px 0 0">
          Kolom pertama menghitung seluruh tautan ke <code>/kontak#form-sampel</code> termasuk
          header dan bilah lengket; kolom kedua hanya yang berada di dalam konten halaman.
          Nol berarti halaman itu mengandalkan header, bukan berarti tidak ada jalan konversi.
        </p>
      </div>

      <div class="card">
        <h3><span class="kdot"></span>Bukti Interaksi</h3>
        <ul class="plain">
          <li>Kalkulator diisi <b>12 ekor</b> menghasilkan hemat bulanan <b>Rp1.152.000</b>
              dan tahunan <b>Rp13.824.000</b>.</li>
          <li>Ajakan di kalkulator mendarat di <b>/kontak#form-sampel</b> dengan kolom jumlah
              sapi <b>terisi 12</b>.</li>
          <li>Jumlah sapi <b>tidak masuk URL</b>: dibawa lewat penyimpanan sesi
              (<code>recob:cattleCount</code>), bukan kueri atau hash.</li>
          <li>Formulir tanpa persetujuan ditolak dengan pesan
              <b>Persetujuan penggunaan data wajib dicentang.</b></li>
        </ul>
      </div>

      <div class="card gap">
        <h3><span class="kdot"></span>Celah yang Belum Ditutup</h3>
        <ul class="plain">
          <li>Kedelapan nama peristiwa <b>sudah dideklarasikan</b> di
              <code>packages/shared/src/constants/funnel-events.ts</code>, dan
              <code>app/actions/track-event.ts</code> sudah ada, tetapi
              <b>tidak ada komponen yang memanggilnya</b>.</li>
          <li>Akibatnya kriteria <b>S8</b> (PRD baris 125), yaitu <code>cta_click</code>,
              <code>sample_form_start</code>, dan <code>sample_form_submit</code> terekam,
              <b>belum terpenuhi</b> walau rangka kerjanya sudah siap.</li>
          <li>Perbaikan terkecil: panggil <code>trackEventAction</code> dari tiga tempat, yaitu
              klik ajakan, mulai mengisi, dan kirim formulir.</li>
        </ul>
      </div>
    </div>
  </section>

  <footer class="bot">
    Sumber: <code>apps/web/app/page.tsx</code>,
    <code>apps/web/app/*/page.tsx</code>,
    <code>apps/web/components/blocks/savings-calculator.tsx</code>,
    <code>apps/web/components/blocks/sample-form.tsx</code>,
    <code>apps/web/app/actions/submit-lead.ts</code>,
    <code>apps/web/lib/utils/cattle-prefill.ts</code>,
    <code>packages/shared/src/constants/funnel-events.ts</code>,
    <code>apps/web/app/sitemap.ts</code>, <code>Docs/PRD.md</code> Bagian 6 dan 7.
    Berkas ini dihasilkan oleh skrip; jangan disunting tangan.
  </footer>
</div>
</body>
</html>
"""
    out = Path("Docs/alur-pelanggan.html")
    if "--check" in sys.argv:
        # Mode gerbang: gagal bila artefak di disk berbeda dari hasil generator.
        if not out.exists():
            print(f"GAGAL: {out} belum dibuat; jalankan `npm run alur:build`")
            sys.exit(1)
        if out.read_text(encoding="utf-8") != doc:
            print(f"GAGAL: {out} basi; jalankan `npm run alur:build` lalu commit hasilnya")
            sys.exit(1)
        print(f"selaras: {out} ({len(doc):,} byte)")
        return
    out.write_text(doc, encoding="utf-8")
    print(f"ditulis {out} | {len(doc):,} byte | svg {height:.0f}px | {len(STAGES)} tahap")


if __name__ == "__main__":
    main()
