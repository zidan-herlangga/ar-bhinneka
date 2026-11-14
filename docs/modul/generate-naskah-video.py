import pathlib
import shutil
from docx import Document
from docx.enum.table import WD_ALIGN_VERTICAL, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

ROOT = pathlib.Path(__file__).resolve().parents[2]
DST = pathlib.Path(__file__).resolve().parent
SRC_IMG = ROOT / "docs" / "laporan" / "img"
for p in SRC_IMG.glob("*.png"):
    shutil.copy2(p, DST / p.name)

OUT = DST / "Naskah-Video-Bhinneka-Tunggal-Ika.docx"

TEAL = RGBColor(0x24, 0x7C, 0x83)
INK = RGBColor(0x35, 0x2B, 0x27)
MUTED = RGBColor(0x6E, 0x66, 0x60)
PRIMARY = RGBColor(0xD9, 0x4A, 0x36)
WARM = RGBColor(0xF2, 0x8C, 0x28)
GREEN = RGBColor(0x47, 0x7A, 0x52)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
TEAL_HEX = "247C83"
IVORY_HEX = "FFF5E8"
BORDER_HEX = "DDD5CB"
ZEBRA_HEX = "FBF7F1"

doc = Document()
section = doc.sections[0]
section.page_width = Cm(21.0)
section.page_height = Cm(29.7)
section.top_margin = Cm(2.0)
section.bottom_margin = Cm(1.8)
section.left_margin = Cm(2.0)
section.right_margin = Cm(2.0)
section.different_first_page_header_footer = True

normal = doc.styles["Normal"]
normal.font.name = "Calibri"
normal.font.size = Pt(10.5)
normal.font.color.rgb = INK
normal.paragraph_format.line_spacing = 1.15
normal.paragraph_format.space_after = Pt(6)

for name, size, color in (("Heading 1", 16, TEAL), ("Heading 2", 12.5, INK), ("Heading 3", 11, TEAL)):
    st = doc.styles[name]
    st.font.name = "Cambria"
    st.font.size = Pt(size)
    st.font.bold = True
    st.font.color.rgb = color
    st.paragraph_format.space_before = Pt(12)
    st.paragraph_format.space_after = Pt(4)
    st.paragraph_format.keep_with_next = True

cp = doc.core_properties
cp.author = "Nabila Arsagita"
cp.title = "Naskah Video Presentasi Bhinneka Tunggal Ika"
cp.subject = "Lomba Media Pembelajaran Online HIMA PGSD 2026"
cp.language = "id-ID"


def shade_cell(cell, hex_color):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), hex_color)
    tc_pr.append(shd)


def set_table_borders(table, color=BORDER_HEX, size="4"):
    tbl_pr = table._tbl.tblPr
    borders = OxmlElement("w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        el = OxmlElement(f"w:{edge}")
        el.set(qn("w:val"), "single")
        el.set(qn("w:sz"), size)
        el.set(qn("w:space"), "0")
        el.set(qn("w:color"), color)
        borders.append(el)
    tbl_pr.append(borders)


def set_cell_margins(table, top=50, left=70, bottom=50, right=70):
    tbl_pr = table._tbl.tblPr
    mar = OxmlElement("w:tblCellMar")
    for tag, value in (("top", top), ("left", left), ("bottom", bottom), ("right", right)):
        el = OxmlElement(f"w:{tag}")
        el.set(qn("w:w"), str(value))
        el.set(qn("w:type"), "dxa")
        mar.append(el)
    tbl_pr.append(mar)


def repeat_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    el = OxmlElement("w:tblHeader")
    el.set(qn("w:val"), "true")
    tr_pr.append(el)


def no_split(row):
    tr_pr = row._tr.get_or_add_trPr()
    el = OxmlElement("w:cantSplit")
    el.set(qn("w:val"), "true")
    tr_pr.append(el)


def add_page_field(paragraph):
    run = paragraph.add_run()
    begin = OxmlElement("w:fldChar")
    begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = " PAGE "
    sep = OxmlElement("w:fldChar")
    sep.set(qn("w:fldCharType"), "separate")
    text = OxmlElement("w:t")
    text.text = "1"
    end = OxmlElement("w:fldChar")
    end.set(qn("w:fldCharType"), "end")
    for el in (begin, instr, sep, text, end):
        run._r.append(el)


def h1(text, page_break=False):
    p = doc.add_heading(text, level=1)
    if page_break:
        p.paragraph_format.page_break_before = True
    return p


def h2(text):
    return doc.add_heading(text, level=2)


def p(text="", bold=False, italic=False, size=None, color=None, align=None, after=None):
    par = doc.add_paragraph()
    run = par.add_run(text)
    run.bold = bold
    run.italic = italic
    if size:
        run.font.size = Pt(size)
    if color:
        run.font.color.rgb = color
    if align is not None:
        par.alignment = align
    if after is not None:
        par.paragraph_format.space_after = Pt(after)
    return par


def bullets(items):
    for item in items:
        if isinstance(item, tuple):
            lead, rest = item
            par = doc.add_paragraph(style="List Bullet")
            par.add_run(lead).bold = True
            par.add_run(rest)
        else:
            doc.add_paragraph(item, style="List Bullet")


def numbered_list(items):
    for index, item in enumerate(items, 1):
        par = doc.add_paragraph()
        fmt = par.paragraph_format
        fmt.left_indent = Cm(0.8)
        fmt.first_line_indent = Cm(-0.8)
        fmt.space_after = Pt(3)
        fmt.tab_stops.add_tab_stop(Cm(0.8))
        par.add_run(f"{index}.\t")
        if isinstance(item, tuple):
            lead, rest = item
            par.add_run(lead).bold = True
            par.add_run(rest)
        else:
            par.add_run(item)


def table(headers, rows, widths, font_size=9, zebra=True, align_center=None):
    tbl = doc.add_table(rows=1, cols=len(headers))
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    set_table_borders(tbl)
    set_cell_margins(tbl)
    for i, width in enumerate(widths):
        tbl.columns[i].width = Cm(width)
    hdr = tbl.rows[0]
    repeat_header(hdr)
    no_split(hdr)
    for i, text in enumerate(headers):
        cell = hdr.cells[i]
        cell.width = Cm(widths[i])
        shade_cell(cell, TEAL_HEX)
        cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        par = cell.paragraphs[0]
        par.paragraph_format.space_after = Pt(0)
        run = par.add_run(text)
        run.bold = True
        run.font.size = Pt(font_size)
        run.font.color.rgb = WHITE
        if align_center and i in align_center:
            par.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for r_index, row in enumerate(rows):
        cells = tbl.add_row().cells
        no_split(tbl.rows[-1])
        for i, value in enumerate(row):
            cell = cells[i]
            cell.width = Cm(widths[i])
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            if zebra and r_index % 2 == 1:
                shade_cell(cell, ZEBRA_HEX)
            par = cell.paragraphs[0]
            par.paragraph_format.space_after = Pt(0)
            par.paragraph_format.line_spacing = 1.05
            run = par.add_run(str(value))
            run.font.size = Pt(font_size)
            if i == 0:
                run.bold = True
            if align_center and i in align_center:
                par.alignment = WD_ALIGN_PARAGRAPH.CENTER
    doc.add_paragraph().paragraph_format.space_after = Pt(2)
    return tbl


def callout(title, text, fill=IVORY_HEX, border="F2C14E"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    set_table_borders(tbl, color=border, size="10")
    set_cell_margins(tbl, top=90, left=130, bottom=90, right=130)
    cell = tbl.cell(0, 0)
    cell.width = Cm(16.0)
    shade_cell(cell, fill)
    par = cell.paragraphs[0]
    par.paragraph_format.space_after = Pt(2)
    run = par.add_run(title)
    run.bold = True
    run.font.size = Pt(10)
    run.font.color.rgb = INK
    par2 = cell.add_paragraph()
    par2.paragraph_format.space_after = Pt(0)
    run2 = par2.add_run(text)
    run2.font.size = Pt(10)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)


# ---------------------------------------------------------------- header/footer
header_p = section.header.paragraphs[0]
header_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
hr = header_p.add_run("Naskah Video  •  Bhinneka Tunggal Ika")
hr.font.size = Pt(8.5)
hr.font.color.rgb = MUTED

footer_p = section.footer.paragraphs[0]
footer_p.paragraph_format.tab_stops.add_tab_stop(Cm(16.0), WD_TAB_ALIGNMENT.RIGHT)
fr = footer_p.add_run("By: Nabila Arsagita  •  Dibuat untuk belajar budaya Indonesia")
fr.font.size = Pt(8.5)
fr.font.color.rgb = MUTED
footer_p.add_run("\t")
pl = footer_p.add_run("Halaman ")
pl.font.size = Pt(8.5)
pl.font.color.rgb = MUTED
add_page_field(footer_p)
for run in footer_p.runs:
    run.font.size = Pt(8.5)
    run.font.color.rgb = MUTED

# ---------------------------------------------------------------- sampul
band = doc.add_table(rows=1, cols=1)
band.alignment = WD_TABLE_ALIGNMENT.CENTER
band.autofit = False
remove_table_borders(band) if False else None
tbl_pr = band._tbl.tblPr
borders = OxmlElement("w:tblBorders")
for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
    el = OxmlElement(f"w:{edge}")
    el.set(qn("w:val"), "nil")
    borders.append(el)
tbl_pr.append(borders)
band.rows[0].height = Cm(0.8)
band.rows[0].height_rule = None
band.cell(0, 0).width = Cm(16.0)
shade_cell(band.cell(0, 0), TEAL_HEX)

for _ in range(3):
    doc.add_paragraph()

logo_par = doc.add_paragraph()
logo_par.alignment = WD_ALIGN_PARAGRAPH.CENTER
logo_par.paragraph_format.space_after = Pt(12)
logo_par.add_run().add_picture(str(DST / "logo.png"), width=Cm(6.0))

kicker = doc.add_paragraph()
kicker.alignment = WD_ALIGN_PARAGRAPH.CENTER
kicker.paragraph_format.space_after = Pt(4)
kr = kicker.add_run("NASKAH VIDEO PRESENTASI")
kr.bold = True
kr.font.size = Pt(10)
kr.font.color.rgb = WARM

title = doc.add_paragraph()
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
title.paragraph_format.space_after = Pt(2)
tr = title.add_run("Bhinneka Tunggal Ika")
tr.bold = True
tr.font.size = Pt(28)
tr.font.name = "Cambria"
tr.font.color.rgb = TEAL

subtitle = doc.add_paragraph()
subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
subtitle.paragraph_format.space_after = Pt(10)
sr = subtitle.add_run("Petualangan Budaya Indonesia")
sr.font.size = Pt(15)
sr.font.name = "Cambria"
sr.font.color.rgb = PRIMARY

desc = doc.add_paragraph()
desc.alignment = WD_ALIGN_PARAGRAPH.CENTER
desc.paragraph_format.space_after = Pt(14)
dr = desc.add_run("Lomba Media Pembelajaran Online HIMA PGSD 2026 (DOKRE 2026)")
dr.font.size = Pt(11)
dr.font.color.rgb = MUTED

info = doc.add_table(rows=0, cols=2)
info.alignment = WD_TABLE_ALIGNMENT.CENTER
info.autofit = False
set_table_borders(info, size="0") if False else None
tbl_pr = info._tbl.tblPr
borders = OxmlElement("w:tblBorders")
for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
    el = OxmlElement(f"w:{edge}")
    el.set(qn("w:val"), "nil")
    borders.append(el)
tbl_pr.append(borders)
set_cell_margins(info, top=40, left=60, bottom=40, right=60)
info_rows = [
    ("Durasi target", "8–9 menit (maks. 10 menit)"),
    ("Format", "Landscape 16:9, minimal 720p (disarankan 1080p)"),
    ("Isi video", "4 poin guidebook: pengenalan, latar belakang & tujuan, cara penggunaan, keunggulan & kesesuaian"),
    ("Penyusun", "Nabila Arsagita"),
    ("Tahun", "2026"),
]
for label, value in info_rows:
    cells = info.add_row().cells
    cells[0].width = Cm(4.0)
    cells[1].width = Cm(12.0)
    lr = cells[0].paragraphs[0].add_run(label)
    lr.bold = True
    lr.font.size = Pt(10)
    lr.font.color.rgb = TEAL
    vr = cells[1].paragraphs[0].add_run(value)
    vr.font.size = Pt(10)
    cells[0].paragraphs[0].paragraph_format.space_after = Pt(2)
    cells[1].paragraphs[0].paragraph_format.space_after = Pt(2)

for _ in range(3):
    doc.add_paragraph()

closing = doc.add_paragraph()
closing.alignment = WD_ALIGN_PARAGRAPH.CENTER
cr = closing.add_run("“Dibuat untuk belajar budaya Indonesia”")
cr.italic = True
cr.font.size = Pt(10)
cr.font.color.rgb = MUTED

doc.add_page_break()

# ---------------------------------------------------------------- 1
h1("1. Panduan Teknis Rekaman")
table(
    ["Aspek", "Ketentuan", "Saran"],
    [
        ["Orientasi", "Landscape (16:9)", "Atur kanvas 1920×1080 di OBS/PowerPoint."],
        ["Resolusi", "Minimal 720p (HD)", "Rekam 1080p agar teks UI terbaca."],
        ["Durasi", "7–10 menit", "Target 8–9 menit; jangan di bawah 7."],
        ["Audio", "Jelas, tanpa noise", "Gunakan mikrofon eksternal; rekam di ruang tenang."],
        ["Visual", "Visualisasi rapi", "Zoom pada bagian UI yang dibahas; gunakan cursor highlight."],
        ["Berkas", "File video (MP4)", "Kompres dengan HandBrake bila >500 MB."],
    ],
    widths=[2.6, 4.6, 8.8],
    font_size=9.5,
)
p("Alat yang disarankan: OBS Studio (rekam layar), Canva/PowerPoint (slide), CapCut/DaVinci (edit).", size=9.5, italic=True)

# ---------------------------------------------------------------- 2
h1("2. Elevator Pitch (60 detik)")
callout(
    "Narasi singkat",
    "“Halo, saya Nabila Arsagita. Media saya bernama Bhinneka Tunggal Ika — Petualangan Budaya Indonesia, "
    "aplikasi web interaktif untuk siswa SD yang mengajak mereka mengenal budaya 38 provinsi "
    "melalui peta, kuis 26 soal, dan tiga permainan budaya. Aplikasi ini dapat dipakai tanpa "
    "internet setelah kunjungan pertama, tanpa akun dan tanpa iklan. Media ini relevan dengan "
    "materi IPAS/IPS dan muatan lokal, serta memudahkan guru mengajarkan keberagaman budaya "
    "Nusantara secara menyenangkan.”",
)

# ---------------------------------------------------------------- 3
h1("3. Struktur Video (sesuai 4 poin guidebook)")
table(
    ["Bagian", "Waktu", "Poin guidebook", "Isi"],
    [
        ["Pembuka", "0:00–0:45", "Pengenalan diri & judul media", "Perkenalan, judul, sasaran, tautan aplikasi."],
        ["Latar belakang", "0:45–2:00", "Latar belakang & tujuan", "Masalah pembelajaran, solusi, tujuan, kesesuaian materi."],
        ["Demo", "2:00–5:30", "Cara penggunaan/pengoperasian", "Beranda, peta, provinsi, kuis, tantangan, profil, offline, instalasi."],
        ["Keunggulan", "5:30–7:30", "Keunggulan & kesesuaian media", "Inovasi, edukatif, praktis, interaktif, offline, ramah anak."],
        ["Penutup", "7:30–8:30", "—", "Kesimpulan, ajakan, kontak, terima kasih."],
    ],
    widths=[2.6, 2.2, 4.6, 6.6],
    font_size=9,
)

# ---------------------------------------------------------------- 4
h1("4. Skenario Adegan (naskah)")
scenes = [
    ("1", "0:00–0:15", "Wajah penyusun + judul besar di layar", "“Halo, saya Nabila Arsagita, mahasiswa PGSD. Media pembelajaran yang saya buat bernama Bhinneka Tunggal Ika — Petualangan Budaya Indonesia.”", "Rekam wajah; pencahayaan dari depan."),
    ("2", "0:15–0:45", "Slide: judul + logo + tautan", "“Media ini adalah aplikasi web interaktif untuk siswa sekolah dasar yang mengajak mereka mengenal budaya 38 provinsi di Indonesia.”", "Tampilkan logo dan URL."),
    ("3", "0:45–1:15", "Slide: masalah pembelajaran", "“Materi budaya sering disajikan dalam teks yang padat, kurang menarik bagi siswa, dan tidak semua sekolah memiliki internet stabil.”", "Bullet poin singkat."),
    ("4", "1:15–1:45", "Slide: tujuan & sasaran", "“Tujuan media ini adalah membantu siswa kelas 3–6 SD mengenal rumah adat, pakaian adat, tarian, alat musik, makanan, dan seni dari seluruh provinsi, sekaligus melatih ingatan melalui kuis dan permainan.”", "Tampilkan tujuan pembelajaran."),
    ("5", "1:45–2:15", "Rekaman layar: beranda", "“Ini tampilan beranda. Siswa disambut dengan nama panggilannya dan dapat langsung mulai menjelajah.”", "Zoom pada tombol “Mulai Menjelajah”."),
    ("6", "2:15–2:45", "Rekaman layar: peta → pulau", "“Siswa memilih kelompok pulau, lalu provinsi. Hotspot peta tidak terlihat agar tampilan tetap bersih, tetapi dapat diklik.”", "Tunjukkan 7 kelompok pulau."),
    ("7", "2:45–3:15", "Rekaman layar: halaman provinsi (Bali)", "“Setiap provinsi menampilkan enam kategori budaya, lengkap dengan sumber rujukan dari Kemendikbud RI dan UNESCO.”", "Scroll perlahan."),
    ("8", "3:15–3:45", "Rekaman layar: kuis (intro + soal)", "“Kuis terdiri dari 26 soal: 9 pilihan ganda, 9 ya/tidak, dan 8 isian singkat. Sebelum mulai, siswa melihat penjelasan cara bermain.”", "Tampilkan soal pilihan ganda."),
    ("9", "3:45–4:15", "Rekaman layar: umpan balik + hasil", "“Setelah menjawab, siswa langsung mendapat umpan balik dan penjelasan. Di akhir, skor, bintang, dan XP ditampilkan.”", "Tampilkan halaman hasil."),
    ("10", "4:15–4:45", "Rekaman layar: Tantangan Budaya", "“Selain kuis, tersedia tiga permainan: Jodohkan Budaya, Kartu Ingatan, dan Tebak dari Petunjuk.”", "Demo singkat Jodohkan."),
    ("11", "4:45–5:15", "Rekaman layar: profil & pencapaian", "“Progres siswa tersimpan di perangkat: level, XP, bintang, riwayat kuis, dan enam lencana.”", "Tunjukkan lencana."),
    ("12", "5:15–5:45", "Rekaman layar: pengaturan", "“Guru dapat mengatur musik, efek suara, ukuran teks, dan mengurangi animasi sesuai kebutuhan siswa.”", "Tunjukkan toggle."),
    ("13", "5:45–6:15", "Rekaman layar: mode offline", "“Aplikasi dapat dipakai tanpa internet setelah kunjungan pertama. Matikan internet, muat ulang, data budaya tetap tampil.”", "Demo offline + banner."),
    ("14", "6:15–6:45", "Rekaman layar: instalasi aplikasi", "“Aplikasi dapat dipasang di layar utama ponsel atau laptop tanpa toko aplikasi.”", "Tunjukkan menu install."),
    ("15", "6:45–7:15", "Slide: keunggulan & kesesuaian", "“Keunggulan media ini: inovatif, edukatif, praktis, interaktif, offline, ramah anak, dan aman. Sesuai dengan materi IPAS/IPS dan muatan lokal.”", "Tabel keunggulan."),
    ("16", "7:15–7:45", "Slide: kesimpulan", "“Dengan media ini, siswa belajar budaya Nusantara secara menyenangkan, kapan saja, di mana saja.”", "Poin utama."),
    ("17", "7:45–8:15", "Wajah penyusun + kontak", "“Terima kasih. Media dapat diakses di bhinneka-tunggal-ika.vercel.app. Pertanyaan dapat disampaikan melalui kontak yang tersedia.”", "Tampilkan URL & kontak."),
]
table(
    ["No", "Waktu", "Visual (layar)", "Narasi", "Catatan teknis"],
    scenes,
    widths=[0.9, 1.7, 4.6, 6.2, 2.6],
    font_size=8.5,
    align_center=[0],
)

# ---------------------------------------------------------------- 5
h1("5. Tips Presentasi")
bullets(
    [
        "Bicara dengan tempo sedang, jeda 1 detik setelah poin penting.",
        "Zoom 150% pada bagian UI yang dibahas agar teks terbaca.",
        "Gunakan kursor highlight atau lingkaran untuk menunjuk tombol.",
        "Hindari membaca narasi verbatim; gunakan sebagai panduan.",
        "Rekam suara terpisah lalu sinkronkan di editor bila perlu.",
        "Pastikan tidak ada notifikasi pop-up saat merekam.",
    ]
)

# ---------------------------------------------------------------- 6
h1("6. Checklist Pra-Rekam")
bullets(
    [
        "Aplikasi dapat dibuka di browser; internet aktif.",
        "Akun/nama panggilan diatur (misalnya “Pahlawan Budaya”).",
        "Cache terisi (buka peta, provinsi, kuis, tantangan).",
        "Uji mode offline sekali (matikan Wi-Fi, buka aplikasi).",
        "Microfon terdeteksi; level suara diuji.",
        "Layar 1920×1080, scaling 100%.",
        "Notifikasi nonaktif (Do Not Disturb).",
        "Rekam 1 take cadangan untuk setiap adegan.",
    ]
)

p()
end_note = doc.add_paragraph()
end_note.alignment = WD_ALIGN_PARAGRAPH.CENTER
end_run = end_note.add_run("— Selesai —")
end_run.italic = True
end_run.font.size = Pt(9)
end_run.font.color.rgb = MUTED

doc.save(OUT)
print(f"Tersimpan: {OUT}")
print(f"Ukuran: {OUT.stat().st_size / 1024 / 1024:.2f} MB")
print(f"Paragraf: {len(doc.paragraphs)}, Tabel: {len(doc.tables)}, Gambar: {len(doc.inline_shapes)}")