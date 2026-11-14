import json
import pathlib
import shutil
from collections import Counter

# Salin gambar pendukung agar folder modul mandiri.
ROOT = pathlib.Path(__file__).resolve().parents[2]
SRC_IMG = ROOT / "docs" / "laporan" / "img"
DST_IMG = pathlib.Path(__file__).resolve().parent / "img"
DST_IMG.mkdir(exist_ok=True)
for p in SRC_IMG.glob("*.png"):
    shutil.copy2(p, DST_IMG / p.name)
for p in SRC_IMG.glob("*.webp"):
    shutil.copy2(p, DST_IMG / p.name)

# parse provinsi
src = (ROOT / "frontend" / "src" / "data" / "provinces.ts").read_text(encoding="utf-8")
import re
items = re.findall(r'\{ id: "([^"]+)", name: "([^"]+)", capital: "([^"]+)", region: "([^"]+)" \}', src)
PROVINCES = [dict(id=i, name=n, capital=c, region=r) for i, n, c, r in items]
REGION_LABEL = {
    "Sumatra": "Pulau Sumatra",
    "Java": "Pulau Jawa",
    "Kalimantan": "Pulau Kalimantan",
    "Sulawesi": "Pulau Sulawesi",
    "BaliNusaTenggara": "Bali & Nusa Tenggara",
    "Maluku": "Kepulauan Maluku",
    "Papua": "Pulau Papua",
}

IMG = DST_IMG
OUT = pathlib.Path(__file__).resolve().parent / "Modul-Penggunaan-Bhinneka-Tunggal-Ika.docx"
TOC_PAGES_FILE = pathlib.Path(__file__).resolve().parent / "toc-pages.json"
TOC_ENTRIES_FILE = pathlib.Path(__file__).resolve().parent / "toc-entries.json"
HEADINGS = []
TOC_MARKER = None
try:
    TOC_PAGES = json.loads(TOC_PAGES_FILE.read_text(encoding="utf-8"))
except FileNotFoundError:
    TOC_PAGES = {}

from docx import Document
from docx.enum.table import WD_ALIGN_VERTICAL, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT, WD_TAB_LEADER
from docx.enum.table import WD_ROW_HEIGHT_RULE
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

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
normal.font.size = Pt(11)
normal.font.color.rgb = INK
normal.paragraph_format.line_spacing = 1.18
normal.paragraph_format.space_after = Pt(6)
normal.element.get_or_add_rPr().rFonts.set(qn("w:eastAsia"), "Calibri")

for name, size, color, before, after in (("Heading 1", 16, TEAL, 16, 6), ("Heading 2", 12.5, INK, 12, 4), ("Heading 3", 11, TEAL, 10, 3)):
    st = doc.styles[name]
    st.font.name = "Cambria"
    st.font.size = Pt(size)
    st.font.bold = True
    st.font.color.rgb = color
    st.paragraph_format.space_before = Pt(before)
    st.paragraph_format.space_after = Pt(after)
    st.paragraph_format.keep_with_next = True
    st.element.get_or_add_rPr().rFonts.set(qn("w:eastAsia"), "Cambria")

cp = doc.core_properties
cp.author = "Nabila Arsagita"
cp.title = "Modul Penggunaan Media Pembelajaran Bhinneka Tunggal Ika"
cp.subject = "Panduan penggunaan media pembelajaran budaya Indonesia untuk SD"
cp.keywords = "budaya Indonesia, 38 provinsi, kuis, aplikasi web, offline, modul penggunaan"
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


def remove_table_borders(table):
    tbl_pr = table._tbl.tblPr
    borders = OxmlElement("w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        el = OxmlElement(f"w:{edge}")
        el.set(qn("w:val"), "nil")
        borders.append(el)
    tbl_pr.append(borders)


def set_cell_margins(table, top=60, left=90, bottom=60, right=90):
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
    HEADINGS.append((1, text))
    return p


def h2(text):
    HEADINGS.append((2, text))
    return doc.add_heading(text, level=2)


def h3(text):
    return doc.add_heading(text, level=3)


def p(text="", bold=False, italic=False, size=None, color=None, align=None, after=None, space_before=None):
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
    if space_before is not None:
        par.paragraph_format.space_before = Pt(space_before)
    return par


def rich(parts, style=None, after=None):
    par = doc.add_paragraph(style=style)
    for text, bold in parts:
        run = par.add_run(text)
        run.bold = bold
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


def table(headers, rows, widths, font_size=10, zebra=True, align_center=None, keep_together=None):
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
    if keep_together is None:
        keep_together = len(rows) <= 9
    rows_to_chain = tbl.rows if keep_together else tbl.rows[-1:]
    for row in rows_to_chain:
        for cell in row.cells:
            for par in cell.paragraphs:
                par.paragraph_format.keep_with_next = True
    spacer = doc.add_paragraph()
    spacer.paragraph_format.space_after = Pt(2)
    spacer.paragraph_format.keep_with_next = True
    return tbl


def caption(text):
    par = doc.add_paragraph()
    par.alignment = WD_ALIGN_PARAGRAPH.CENTER
    par.paragraph_format.space_before = Pt(2)
    par.paragraph_format.space_after = Pt(8)
    run = par.add_run(text)
    run.italic = True
    run.font.size = Pt(9)
    run.font.color.rgb = MUTED


def figure(filename, caption_text, width=15.0):
    par = doc.add_paragraph()
    par.alignment = WD_ALIGN_PARAGRAPH.CENTER
    par.paragraph_format.space_before = Pt(4)
    par.paragraph_format.space_after = Pt(2)
    par.paragraph_format.keep_with_next = True
    par.add_run().add_picture(str(IMG / filename), width=Cm(width))
    caption(caption_text)


def callout(title, text, fill=IVORY_HEX, border="F2C14E"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    set_table_borders(tbl, color=border, size="10")
    set_cell_margins(tbl, top=100, left=140, bottom=100, right=140)
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


def toc_entry(text, level, page):
    par = TOC_MARKER.insert_paragraph_before()
    fmt = par.paragraph_format
    fmt.left_indent = Cm(0.0 if level == 1 else 0.55)
    fmt.space_before = Pt(6 if level == 1 else 0)
    fmt.space_after = Pt(2)
    fmt.tab_stops.add_tab_stop(Cm(16.0), WD_TAB_ALIGNMENT.RIGHT, WD_TAB_LEADER.DOTS)
    run = par.add_run(text)
    run.bold = level == 1
    run.font.size = Pt(11 if level == 1 else 10)
    run.font.color.rgb = INK if level == 1 else MUTED
    page_run = par.add_run("\t" + str(page))
    page_run.bold = level == 1
    page_run.font.size = Pt(11 if level == 1 else 10)
    page_run.font.color.rgb = INK if level == 1 else MUTED


# ---------------------------------------------------------------- header/footer
header_p = section.header.paragraphs[0]
header_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
header_run = header_p.add_run("Modul Penggunaan  •  Bhinneka Tunggal Ika")
header_run.font.size = Pt(8.5)
header_run.font.color.rgb = MUTED

footer_p = section.footer.paragraphs[0]
footer_p.paragraph_format.tab_stops.add_tab_stop(Cm(16.0), WD_TAB_ALIGNMENT.RIGHT)
footer_run = footer_p.add_run("By: Nabila Arsagita  •  Dibuat untuk belajar budaya Indonesia")
footer_run.font.size = Pt(8.5)
footer_run.font.color.rgb = MUTED
footer_p.add_run("\t")
page_label = footer_p.add_run("Halaman ")
page_label.font.size = Pt(8.5)
page_label.font.color.rgb = MUTED
add_page_field(footer_p)
for run in footer_p.runs:
    run.font.size = Pt(8.5)
    run.font.color.rgb = MUTED


# ---------------------------------------------------------------- sampul
band = doc.add_table(rows=1, cols=1)
band.alignment = WD_TABLE_ALIGNMENT.CENTER
band.autofit = False
remove_table_borders(band)
band.rows[0].height = Cm(0.8)
band.rows[0].height_rule = WD_ROW_HEIGHT_RULE.EXACTLY
band.cell(0, 0).width = Cm(16.0)
shade_cell(band.cell(0, 0), TEAL_HEX)

for _ in range(3):
    doc.add_paragraph()

logo_par = doc.add_paragraph()
logo_par.alignment = WD_ALIGN_PARAGRAPH.CENTER
logo_par.paragraph_format.space_after = Pt(14)
logo_par.add_run().add_picture(str(IMG / "logo.png"), width=Cm(7.4))

kicker = doc.add_paragraph()
kicker.alignment = WD_ALIGN_PARAGRAPH.CENTER
kicker.paragraph_format.space_after = Pt(4)
kr = kicker.add_run("MODUL PENGGUNAAN")
kr.bold = True
kr.font.size = Pt(10)
kr.font.color.rgb = WARM

title = doc.add_paragraph()
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
title.paragraph_format.space_after = Pt(2)
tr = title.add_run("Bhinneka Tunggal Ika")
tr.bold = True
tr.font.size = Pt(30)
tr.font.name = "Cambria"
tr.font.color.rgb = TEAL

subtitle = doc.add_paragraph()
subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
subtitle.paragraph_format.space_after = Pt(10)
sr = subtitle.add_run("Petualangan Budaya Indonesia")
sr.font.size = Pt(17)
sr.font.name = "Cambria"
sr.font.color.rgb = PRIMARY

divider = doc.add_paragraph()
divider.alignment = WD_ALIGN_PARAGRAPH.CENTER
divider.paragraph_format.space_after = Pt(12)
# bottom border via pBdr
p_pr = divider._p.get_or_add_pPr()
p_bdr = OxmlElement("w:pBdr")
bottom = OxmlElement("w:bottom")
bottom.set(qn("w:val"), "single")
bottom.set(qn("w:sz"), "12")
bottom.set(qn("w:space"), "6")
bottom.set(qn("w:color"), "F2C14E")
p_bdr.append(bottom)
p_pr.append(p_bdr)

desc = doc.add_paragraph()
desc.alignment = WD_ALIGN_PARAGRAPH.CENTER
desc.paragraph_format.space_after = Pt(18)
dr = desc.add_run("Panduan praktis untuk guru dan siswa sekolah dasar")
dr.font.size = Pt(11.5)
dr.font.color.rgb = MUTED

info = doc.add_table(rows=0, cols=2)
info.alignment = WD_TABLE_ALIGNMENT.CENTER
info.autofit = False
remove_table_borders(info)
set_cell_margins(info, top=50, left=60, bottom=50, right=60)
info_rows = [
    ("Jenis berkas", "Modul penggunaan media pembelajaran"),
    ("Mata pelajaran", "IPAS / IPS dan muatan lokal (budaya Nusantara)"),
    ("Fase / kelas", "Fase B–C (kelas 3–6 SD)"),
    ("Bentuk media", "Aplikasi web interaktif (dapat dipasang dan dipakai tanpa internet)"),
    ("Tautan aplikasi", "https://bhinneka-tunggal-ika.vercel.app"),
    ("Disiapkan untuk", "Lomba Media Pembelajaran Online HIMA PGSD 2026"),
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
    cells[0].paragraphs[0].paragraph_format.space_after = Pt(3)
    cells[1].paragraphs[0].paragraph_format.space_after = Pt(3)

for _ in range(4):
    doc.add_paragraph()

closing = doc.add_paragraph()
closing.alignment = WD_ALIGN_PARAGRAPH.CENTER
cr = closing.add_run("“Dibuat untuk belajar budaya Indonesia”")
cr.italic = True
cr.font.size = Pt(10)
cr.font.color.rgb = MUTED

doc.add_page_break()

# ---------------------------------------------------------------- daftar isi
toc_title = doc.add_paragraph()
toc_title.paragraph_format.space_before = Pt(0)
toc_title.paragraph_format.space_after = Pt(10)
toc_run = toc_title.add_run("Daftar Isi")
toc_run.bold = True
toc_run.font.name = "Cambria"
toc_run.font.size = Pt(16)
toc_run.font.color.rgb = TEAL
TOC_MARKER = doc.add_paragraph()
doc.add_page_break()


# ---------------------------------------------------------------- 1
h1("1. Tentang Media Ini")
h2("1.1 Apa itu Bhinneka Tunggal Ika?")
p(
    "Bhinneka Tunggal Ika — Petualangan Budaya Indonesia adalah aplikasi web edukasi yang "
    "mengajak siswa sekolah dasar mengenal budaya 38 provinsi melalui peta interaktif, kuis "
    "26 soal, dan tiga permainan budaya. Aplikasi berjalan di browser (Chrome, Edge, Safari, "
    "Firefox) pada laptop, tablet, dan ponsel. Tidak memerlukan akun, tidak ada iklan, dan "
    "dapat dipakai tanpa internet setelah kunjungan pertama."
)
h2("1.2 Untuk siapa?")
table(
    ["Pengguna", "Cara memakai"],
    [
        ["Siswa kelas 3–6 SD", "Menjelajah peta, membaca budaya, mengerjakan kuis dan tantangan, melihat progres."],
        ["Guru", "Media pendamping IPAS/IPS/muatan lokal, tugas mandiri, demonstrasi di kelas."],
        ["Orang tua", "Aktivitas belajar di rumah; cukup membuka tautan, tanpa perlu unduh."],
    ],
    widths=[4.2, 11.8],
)
h2("1.3 Tujuan pembelajaran")
p("Rumusan tujuan pembelajaran yang dapat dicapai melalui media ini:", after=3)
bullets(
    [
        "Menyebutkan nama provinsi dan ibu kotanya.",
        "Menjelaskan ciri khas budaya (rumah adat, pakaian adat, tarian, alat musik, makanan, seni) dari berbagai provinsi.",
        "Mengaitkan budaya dengan wilayah pulau di Indonesia.",
        "Mengembangkan rasa bangga terhadap keberagaman budaya Nusantara.",
        "Melatih ketelitian dan ingatan melalui kuis dan permainan budaya.",
    ]
)
h2("1.4 Manfaat")
bullets(
    [
        ("Bagi siswa: ", "belajar budaya sambil bermain, umpan balik langsung, progres tersimpan di perangkat."),
        ("Bagi guru: ", "media siap pakai, tidak perlu instalasi, dapat dipakai offline."),
        ("Bagi sekolah: ", "tidak memerlukan anggaran perangkat khusus; cukup browser modern."),
    ]
)

# ---------------------------------------------------------------- 2
h1("2. Kesesuaian dengan Pembelajaran")
h2("2.1 Mata pelajaran dan fase")
table(
    ["Aspek", "Keterangan"],
    [
        ["Mata pelajaran", "IPAS / IPS dan muatan lokal (budaya Nusantara)"],
        ["Fase", "Fase B–C (kelas 3–6 SD)"],
        ["Materi", "Keragaman budaya Indonesia: rumah adat, pakaian adat, tarian, alat musik, makanan khas, seni & kerajinan"],
        ["Alokasi waktu", "2 × 35 menit (1 pertemuan) atau 2 pertemuan"],
        ["Model", "Discovery learning / Problem Based Learning"],
    ],
    widths=[4.2, 11.8],
)
h2("2.2 Cakupan materi")
p("Aplikasi mencakup seluruh 38 provinsi dalam tujuh kelompok pulau, dengan enam kategori budaya untuk setiap provinsi (total 228 entri).")
table(
    ["Kelompok Pulau", "Jumlah Provinsi"],
    [[REGION_LABEL[r], str(c)] for r, c in Counter(x["region"] for x in PROVINCES).items()] + [["Total", str(len(PROVINCES))]],
    widths=[10.0, 6.0],
    align_center=[1],
)
h2("2.3 Alur pembelajaran 2 × 35 menit")
table(
    ["Tahap", "Waktu", "Kegiatan guru", "Kegiatan siswa"],
    [
        ["Pembukaan", "5 menit", "Apersepsi: tanya budaya dari daerah asal siswa.", "Menjawab, menyimak."],
        ["Inti 1", "15 menit", "Demo aplikasi: peta → provinsi → budaya.", "Mengamati, mencatat 3 budaya provinsi pilihan."],
        ["Inti 2", "10 menit", "Siswa mengerjakan kuis 26 soal secara mandiri/berpasangan.", "Mengerjakan, melihat skor & bintang."],
        ["Penutup", "5 menit", "Refleksi: budaya apa yang paling menarik dan mengapa.", "Menyampaikan refleksi, mengisi lembar aktivitas."],
    ],
    widths=[2.4, 2.2, 6.0, 5.4],
    font_size=9.5,
)
h2("2.4 Lembar aktivitas siswa")
p("Guru dapat mencetak lembar berikut untuk dicatat siswa setelah menjelajah aplikasi.")
table(
    ["Nama", "Kelas", "Provinsi yang dipilih", "3 budaya yang dicatat", "Hal yang paling menarik"],
    [["", "", "", "", ""]],
    widths=[3.0, 1.6, 3.6, 4.4, 3.4],
    font_size=9,
    zebra=False,
)
h2("2.5 Ide penilaian")
bullets(
    [
        "Penilaian formatif otomatis melalui kuis: 1 poin per jawaban benar (maks. 26).",
        "Bintang: 3 bintang (≥80%), 2 bintang (≥60%), 1 bintang (<60%).",
        "Penilaian proses: observasi keterlibatan, kerja sama, dan ketelitian.",
        "Produk: lembar aktivitas siswa yang sudah diisi.",
    ]
)
table(
    ["Aspek", "3 (Baik)", "2 (Cukup)", "1 (Perlu bimbingan)"],
    [
        ["Keterlibatan", "Aktif sepanjang pembelajaran.", "Aktif sebagian.", "Kurang aktif."],
        ["Ketepatan jawaban", "≥80% benar.", "60–79% benar.", "<60% benar."],
        ["Lembar aktivitas", "Lengkap dan rapi.", "Sebagian terisi.", "Belum terisi."],
    ],
    widths=[3.4, 4.2, 4.2, 4.2],
    font_size=9,
)

# ---------------------------------------------------------------- 3
h1("3. Memulai")
h2("3.1 Perangkat dan browser")
table(
    ["Kebutuhan", "Keterangan"],
    [
        ["Perangkat", "Laptop, tablet, atau ponsel dengan layar sentuh"],
        ["Browser", "Chrome, Edge, Safari, atau Firefox versi terbaru"],
        ["Internet", "Diperlukan pada kunjungan pertama untuk mengunduh aplikasi (±3,4 MB)"],
        ["Penyimpanan", "Setidaknya 10 MB ruang kosong untuk penyimpanan sementara"],
    ],
    widths=[4.2, 11.8],
)
h2("3.2 Membuka aplikasi")
numbered_list(
    [
        "Buka browser, lalu ketik tautan: https://bhinneka-tunggal-ika.vercel.app",
        "Tunggu 10–20 detik hingga halaman beranda tampil.",
        "Jelajahi beberapa halaman (peta, satu provinsi, kuis) agar aset tersimpan.",
    ]
)
h2("3.3 Memasang di layar utama")
h3("Android (Chrome)")
numbered_list(["Buka tautan aplikasi.", "Ketuk menu ⋮, pilih “Install app” atau “Tambahkan ke layar utama”.", "Buka aplikasi dari ikon yang muncul."])
h3("iPhone / iPad (Safari)")
numbered_list(["Buka tautan di Safari.", "Ketuk tombol Bagikan, pilih “Add to Home Screen”.", "Buka dari ikon di layar utama."])
h3("Laptop (Chrome / Edge)")
numbered_list(["Buka tautan aplikasi.", "Klik ikon install di address bar, atau menu ⋮ → “Install”."])
h2("3.4 Mode offline")
p(
    "Setelah kunjungan pertama, aplikasi dapat dibuka tanpa internet. Tandanya, banner "
    "“Kamu sedang offline. Peta, budaya, kuis, dan tantangan tetap bisa dimainkan.” muncul "
    "di bagian atas. Data budaya dan soal kuis diambil dari penyimpanan lokal."
)
callout(
    "Penting",
    "Kunjungan pertama wajib online. Jangan memilih “Clear site data” atau menghapus penyimpanan "
    "sementara situs, karena akan menghapus mode offline dan progres.",
    fill="FDECEA",
    border="D94A36",
)

# ---------------------------------------------------------------- 4
h1("4. Menjelajah Aplikasi")
h2("4.1 Beranda")
figure("01-beranda.png", "Gambar 1. Beranda dengan sapaan personal dan pintasan Tantangan Budaya.", width=15.0)
bullets(
    [
        "Sapaan personal sesuai nama panggilan yang diatur.",
        "Tombol “Mulai Menjelajah” menuju peta Nusantara.",
        "Pintasan ke Tantangan Budaya dan ringkasan progres.",
    ]
)
h2("4.2 Peta dan navigasi")
figure("02-peta.png", "Gambar 2. Peta Indonesia dengan tujuh kelompok pulau.", width=15.0)
figure("03-pulau.png", "Gambar 3. Daftar provinsi pada kelompok pulau terpilih.", width=15.0)
numbered_list(
    [
        "Pilih salah satu dari tujuh kelompok pulau.",
        "Pilih provinsi yang ingin dipelajari.",
        "Gunakan breadcrumb di atas untuk kembali.",
    ]
)
h2("4.3 Halaman provinsi")
figure("04-provinsi.png", "Gambar 4. Halaman provinsi dengan enam kategori budaya dan sumbernya.", width=15.0)
p("Setiap provinsi menampilkan enam kategori budaya, lengkap dengan sumber rujukan.")
bullets(
    [
        "Rumah adat, pakaian adat, tarian, alat musik, makanan khas, seni & kerajinan.",
        "Tombol “Mulai Kuis” untuk menguji pemahaman.",
    ]
)
h2("4.4 Kuis 26 soal")
figure("06-kuis-intro.png", "Gambar 5. Penjelasan sebelum kuis dimulai.", width=15.0)
figure("07-kuis-soal.png", "Gambar 6. Soal pilihan ganda dengan progres dan skor.", width=15.0)
figure("08-kuis-jawaban.png", "Gambar 7. Umpan balik dan penjelasan setelah menjawab.", width=15.0)
figure("09-kuis-hasil.png", "Gambar 8. Halaman hasil: skor, bintang, dan XP.", width=15.0)
table(
    ["Jenis soal", "Jumlah", "Cara menjawab", "Penilaian"],
    [
        ["Pilihan ganda", "9", "Pilih satu opsi.", "Cocok persis dengan kunci."],
        ["Ya / Tidak", "9", "Pilih “Ya” atau “Tidak”.", "Cocok persis dengan kunci."],
        ["Isian singkat", "8", "Tulis jawaban (maks. 200 karakter).", "Mengandung salah satu kata kunci."],
        ["Total", "26", "—", "1 poin per jawaban benar."],
    ],
    widths=[3.0, 2.0, 5.6, 5.4],
    font_size=9.5,
    align_center=[1],
)
p("Aturan penilaian: 3 bintang (≥80%), 2 bintang (≥60%), 1 bintang (<60%). Setiap jawaban benar memberi 10 XP.")
h2("4.5 Tantangan Budaya")
figure("15-tantangan-jodohkan.png", "Gambar 9. Permainan Jodohkan Budaya.", width=15.0)
table(
    ["Permainan", "Cara bermain"],
    [
        ["Jodohkan Budaya", "Menebak provinsi asal dari rumah adat, tarian, atau makanan yang muncul."],
        ["Kartu Ingatan", "Membalik kartu dan memasangkan nama budaya dengan provinsi asalnya."],
        ["Tebak dari Petunjuk", "Membaca ciri-ciri budaya, lalu menebak nama budaya yang dimaksud."],
    ],
    widths=[4.2, 11.8],
)
h2("4.6 Profil dan Pencapaian")
figure("10-profil.png", "Gambar 10. Halaman profil: level, XP, bintang, dan riwayat kuis.", width=15.0)
figure("11-pencapaian.png", "Gambar 11. Halaman pencapaian dengan enam lencana.", width=15.0)
p("Progres tersimpan di perangkat (penyimpanan lokal). Enam lencana terbuka pada 1, 3, 5, 8, 12, dan 20 bintang.")
h2("4.7 Pengaturan")
figure("12-pengaturan.png", "Gambar 12. Halaman pengaturan.", width=15.0)
bullets(
    [
        "Profil: nama panggilan dan avatar.",
        "Tampilan: musik latar, efek suara, kurangi animasi, teks lebih besar.",
        "Data: reset progres (harus dikonfirmasi).",
        "Koneksi: alamat server (untuk penggunaan khusus).",
    ]
)

# ---------------------------------------------------------------- 5
h1("5. Keunggulan Media")
table(
    ["Keunggulan", "Penjelasan", "Bukti di aplikasi"],
    [
        ["Inovatif", "Peta interaktif, kuis, dan tiga permainan budaya dalam satu aplikasi.", "Peta, kuis, Tantangan Budaya"],
        ["Edukatif", "228 entri budaya dari 38 provinsi dengan sumber rujukan.", "Halaman provinsi"],
        ["Praktis", "Tanpa akun, tanpa instalasi, cukup browser.", "Beranda, Pengaturan"],
        ["Interaktif", "Umpan balik langsung, skor, bintang, XP, dan lencana.", "Kuis, Pencapaian"],
        ["Offline", "Dapat dipakai tanpa internet setelah kunjungan pertama.", "Banner mode offline"],
        ["Ramah anak", "Bahasa sederhana, ikon konsisten, opsi kurangi animasi.", "Seluruh antarmuka"],
        ["Aman", "Tanpa iklan, tanpa pelacakan, data tersimpan di perangkat.", "Profil, Pengaturan"],
    ],
    widths=[3.0, 8.0, 5.0],
    font_size=9.5,
)

# ---------------------------------------------------------------- 6
h1("6. Pemecahan Masalah")
table(
    ["Gejala", "Penyebab", "Solusi"],
    [
        ["Halaman tidak muncul", "Koneksi internet belum stabil.", "Muat ulang; coba jaringan lain."],
        ["Mode offline tidak aktif", "Kunjungan pertama belum selesai.", "Buka beberapa halaman dengan internet, tunggu 10–20 detik."],
        ["Musik tidak bunyi", "Musik dimatikan atau browser memblokir audio.", "Aktifkan musik di Pengaturan; ketuk layar sekali."],
        ["Progres hilang", "Cache situs dihapus.", "Hindari “Clear site data”; ulangi dari awal."],
        ["Teks terlalu kecil/besar", "Pengaturan tampilan.", "Ubah “Teks lebih besar” di Pengaturan."],
        ["Animasi mengganggu", "Preferensi tampilan.", "Aktifkan “Kurangi animasi”."],
        ["Skor tidak terkirim", "Sedang offline.", "Skor tetap tersimpan di perangkat."],
    ],
    widths=[4.6, 5.6, 5.8],
    font_size=9.5,
)

# ---------------------------------------------------------------- 7
h1("7. Catatan untuk Guru")
bullets(
    [
        "Gunakan 1 pertemuan (2 × 35 menit) atau bagi menjadi dua pertemuan.",
        "Siswa dapat bekerja individu, berpasangan, atau kelompok kecil.",
        "Pendampingan diperlukan untuk siswa yang belum lancar membaca.",
        "Manfaatkan mode offline bila jaringan sekolah tidak stabil.",
        "Diskusikan hasil kuis dan budaya yang paling menarik di akhir pembelajaran.",
        "Tidak perlu akun: progres tersimpan di perangkat masing-masing siswa.",
        "Minta siswa membawa lembar aktivitas yang sudah diisi sebagai bukti belajar.",
    ]
)

h2("7.1 Istilah penting")
table(
    ["Istilah", "Arti sederhana"],
    [
        ["Aplikasi web", "Program yang dibuka lewat browser, tanpa perlu diunduh."],
        ["Mode offline", "Kondisi ketika aplikasi dipakai tanpa internet."],
        ["Cache", "Penyimpanan sementara di perangkat agar halaman cepat dimuat."],
        ["PWA", "Aplikasi web yang bisa dipasang di layar utama."],
        ["Progres", "Level, XP, bintang, dan riwayat kuis yang tersimpan."],
    ],
    widths=[4.0, 12.0],
    font_size=9.5,
)

# ---------------------------------------------------------------- 8
h1("8. Lampiran: Daftar 38 Provinsi")
table(
    ["No", "Provinsi", "Ibu kota", "Pulau"],
    [[str(i + 1), p["name"], p["capital"], REGION_LABEL[p["region"]]] for i, p in enumerate(PROVINCES)],
    widths=[1.2, 5.6, 4.6, 4.6],
    font_size=9,
    align_center=[0],
)

# ---------------------------------------------------------------- penutup
h1("Penutup", page_break=True)
p(
    "Modul ini disusun agar guru dan siswa dapat memanfaatkan aplikasi Bhinneka Tunggal Ika "
    "secara mandiri. Semoga media ini membantu siswa mengenal dan mencintai budaya Nusantara."
)
p()
end_note = doc.add_paragraph()
end_note.alignment = WD_ALIGN_PARAGRAPH.CENTER
end_run = end_note.add_run("— Selesai —")
end_run.italic = True
end_run.font.size = Pt(9)
end_run.font.color.rgb = MUTED

# ---------------------------------------------------------------- daftar isi final
for level, text in HEADINGS:
    toc_entry(text, level, TOC_PAGES.get(text, "0"))
TOC_MARKER._element.getparent().remove(TOC_MARKER._element)
TOC_ENTRIES_FILE.write_text(
    json.dumps([{"level": lvl, "text": txt} for lvl, txt in HEADINGS], ensure_ascii=False, indent=2),
    encoding="utf-8",
)

doc.save(OUT)
print(f"Tersimpan: {OUT}")
print(f"Ukuran: {OUT.stat().st_size / 1024 / 1024:.2f} MB")
print(f"Paragraf: {len(doc.paragraphs)}, Tabel: {len(doc.tables)}, Gambar: {len(doc.inline_shapes)}")