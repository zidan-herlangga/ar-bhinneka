# -*- coding: utf-8 -*-
"""Membuat laporan .docx untuk aplikasi Bhinneka Tunggal Ika.

Daftar isi ditulis statis (bukan field Word) agar tampil benar di Word, WPS,
maupun Google Docs. Nomor halamannya dibaca dari toc-pages.json, yang diisi
dari hasil pemindaian PDF pratinjau. Bila isi laporan berubah, perbarui
toc-pages.json lalu bangun ulang dokumen.
"""

from pathlib import Path
import json

from docx import Document
from docx.enum.table import WD_ALIGN_VERTICAL, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT, WD_TAB_LEADER
from docx.enum.table import WD_ROW_HEIGHT_RULE
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

ROOT = Path(__file__).resolve().parents[2]
IMG = ROOT / "docs" / "laporan" / "img"
OUT = ROOT / "docs" / "laporan" / "Laporan-Bhinneka-Tunggal-Ika.docx"
TOC_PAGES_FILE = ROOT / "docs" / "laporan" / "toc-pages.json"
TOC_ENTRIES_FILE = ROOT / "docs" / "laporan" / "toc-entries.json"

HEADINGS = []
TOC_MARKER = None
try:
    TOC_PAGES = json.loads(TOC_PAGES_FILE.read_text(encoding="utf-8"))
except FileNotFoundError:
    TOC_PAGES = {}

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

# ---------------------------------------------------------------- properti
cp = doc.core_properties
cp.author = "Nabila Arsagita"
cp.last_modified_by = "Nabila Arsagita"
cp.title = "Laporan Pengembangan Aplikasi Bhinneka Tunggal Ika"
cp.subject = "Aplikasi pembelajaran budaya Indonesia untuk siswa SD"
cp.keywords = "budaya Indonesia, 38 provinsi, kuis, PWA, offline, edukasi"
cp.language = "id-ID"
cp.comments = "Dibuat untuk belajar budaya Indonesia."

# ---------------------------------------------------------------- halaman
section = doc.sections[0]
section.page_width = Cm(21.0)
section.page_height = Cm(29.7)
section.top_margin = Cm(2.2)
section.bottom_margin = Cm(2.0)
section.left_margin = Cm(2.4)
section.right_margin = Cm(2.2)
section.header_distance = Cm(1.1)
section.footer_distance = Cm(1.0)
section.different_first_page_header_footer = True

# ---------------------------------------------------------------- gaya dasar
normal = doc.styles["Normal"]
normal.font.name = "Calibri"
normal.font.size = Pt(10.5)
normal.font.color.rgb = INK
normal.paragraph_format.line_spacing = 1.15
normal.paragraph_format.space_after = Pt(6)
normal.element.get_or_add_rPr().rFonts.set(qn("w:eastAsia"), "Calibri")

for name, size, color, before, after in (
    ("Heading 1", 17, TEAL, 18, 7),
    ("Heading 2", 12.5, INK, 12, 4),
    ("Heading 3", 11, TEAL, 10, 3),
):
    st = doc.styles[name]
    st.font.name = "Cambria"
    st.font.size = Pt(size)
    st.font.bold = True
    st.font.color.rgb = color
    st.paragraph_format.space_before = Pt(before)
    st.paragraph_format.space_after = Pt(after)
    st.paragraph_format.keep_with_next = True
    st.element.get_or_add_rPr().rFonts.set(qn("w:eastAsia"), "Cambria")

for name in ("List Bullet", "List Number"):
    st = doc.styles[name]
    st.font.name = "Calibri"
    st.font.size = Pt(10.5)
    st.paragraph_format.space_after = Pt(3)


# ---------------------------------------------------------------- utilitas
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


def para_bottom_border(paragraph, color=BORDER_HEX, size="6"):
    p_pr = paragraph._p.get_or_add_pPr()
    p_bdr = OxmlElement("w:pBdr")
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), size)
    bottom.set(qn("w:space"), "6")
    bottom.set(qn("w:color"), color)
    p_bdr.append(bottom)
    p_pr.append(p_bdr)


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


def rich(parts, style=None, after=None):
    """parts: list of (text, bold) tuples."""
    par = doc.add_paragraph(style=style)
    for text, bold in parts:
        run = par.add_run(text)
        run.bold = bold
    if after is not None:
        par.paragraph_format.space_after = Pt(after)
    return par


def bullets(items, numbered=False):
    if numbered:
        # Nomor ditulis manual agar setiap daftar dimulai dari 1, bukan melanjutkan
        # penomoran daftar sebelumnya (perilaku bawaan gaya "List Number" di Word).
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
        return

    for item in items:
        if isinstance(item, tuple):
            lead, rest = item
            par = doc.add_paragraph(style="List Bullet")
            par.add_run(lead).bold = True
            par.add_run(rest)
        else:
            doc.add_paragraph(item, style="List Bullet")


def table(headers, rows, widths, font_size=9.5, zebra=True, align_center=None, keep_together=None):
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
    par.paragraph_format.space_after = Pt(10)
    run = par.add_run(text)
    run.italic = True
    run.font.size = Pt(8.5)
    run.font.color.rgb = MUTED


def figure(filename, caption_text, width=15.4):
    # Gambar dan keterangan diletakkan dalam satu sel tabel tanpa garis yang
    # tidak boleh terpotong, sehingga keterangan tidak pernah tertinggal di
    # halaman berikutnya.
    holder = doc.add_table(rows=1, cols=1)
    holder.alignment = WD_TABLE_ALIGNMENT.CENTER
    holder.autofit = False
    remove_table_borders(holder)
    set_cell_margins(holder, top=0, left=0, bottom=0, right=0)
    holder.columns[0].width = Cm(15.6)
    row = holder.rows[0]
    no_split(row)
    cell = row.cells[0]
    cell.width = Cm(15.6)
    par = cell.paragraphs[0]
    par.alignment = WD_ALIGN_PARAGRAPH.CENTER
    par.paragraph_format.space_before = Pt(4)
    par.paragraph_format.space_after = Pt(2)
    par.add_run().add_picture(str(IMG / filename), width=Cm(width))
    cap = cell.add_paragraph()
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cap.paragraph_format.space_before = Pt(2)
    cap.paragraph_format.space_after = Pt(0)
    cap_run = cap.add_run(caption_text)
    cap_run.italic = True
    cap_run.font.size = Pt(8.5)
    cap_run.font.color.rgb = MUTED
    doc.add_paragraph().paragraph_format.space_after = Pt(2)


def figure_pair_mobile(file1, file2, caption_text):
    holder = doc.add_table(rows=1, cols=1)
    holder.alignment = WD_TABLE_ALIGNMENT.CENTER
    holder.autofit = False
    remove_table_borders(holder)
    set_cell_margins(holder, top=0, left=0, bottom=0, right=0)
    holder.columns[0].width = Cm(15.6)
    row = holder.rows[0]
    no_split(row)
    cell = row.cells[0]
    cell.width = Cm(15.6)

    inner = cell.add_table(rows=1, cols=2)
    inner.alignment = WD_TABLE_ALIGNMENT.CENTER
    inner.autofit = False
    remove_table_borders(inner)
    for i, filename in enumerate((file1, file2)):
        inner.columns[i].width = Cm(7.6)
        inner_cell = inner.cell(0, i)
        inner_cell.width = Cm(7.6)
        par = inner_cell.paragraphs[0]
        par.alignment = WD_ALIGN_PARAGRAPH.CENTER
        par.paragraph_format.space_after = Pt(2)
        par.add_run().add_picture(str(IMG / filename), width=Cm(6.3))

    cap = cell.add_paragraph()
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cap.paragraph_format.space_before = Pt(2)
    cap.paragraph_format.space_after = Pt(0)
    cap_run = cap.add_run(caption_text)
    cap_run.italic = True
    cap_run.font.size = Pt(8.5)
    cap_run.font.color.rgb = MUTED
    doc.add_paragraph().paragraph_format.space_after = Pt(2)


def callout(title, text, fill=IVORY_HEX, border="F2C14E"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    set_table_borders(tbl, color=border, size="10")
    set_cell_margins(tbl, top=100, left=140, bottom=100, right=140)
    cell = tbl.cell(0, 0)
    cell.width = Cm(15.6)
    shade_cell(cell, fill)
    par = cell.paragraphs[0]
    par.paragraph_format.space_after = Pt(2)
    run = par.add_run(title)
    run.bold = True
    run.font.size = Pt(9.5)
    run.font.color.rgb = INK
    par2 = cell.add_paragraph()
    par2.paragraph_format.space_after = Pt(0)
    run2 = par2.add_run(text)
    run2.font.size = Pt(9.5)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)


def toc_entry(text, level, page):
    par = TOC_MARKER.insert_paragraph_before()
    fmt = par.paragraph_format
    fmt.left_indent = Cm(0.0 if level == 1 else 0.55)
    fmt.space_before = Pt(6 if level == 1 else 0)
    fmt.space_after = Pt(2)
    fmt.tab_stops.add_tab_stop(Cm(16.4), WD_TAB_ALIGNMENT.RIGHT, WD_TAB_LEADER.DOTS)
    run = par.add_run(text)
    run.bold = level == 1
    run.font.size = Pt(10.5 if level == 1 else 10)
    run.font.color.rgb = INK if level == 1 else MUTED
    page_run = par.add_run("\t" + str(page))
    page_run.bold = level == 1
    page_run.font.size = Pt(10.5 if level == 1 else 10)
    page_run.font.color.rgb = INK if level == 1 else MUTED

# ---------------------------------------------------------------- header/footer
header_p = section.header.paragraphs[0]
header_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
header_run = header_p.add_run("Laporan Pengembangan Aplikasi  •  Bhinneka Tunggal Ika")
header_run.font.size = Pt(8)
header_run.font.color.rgb = MUTED
para_bottom_border(header_p)

footer_p = section.footer.paragraphs[0]
footer_p.paragraph_format.tab_stops.add_tab_stop(Cm(16.4), WD_TAB_ALIGNMENT.RIGHT)
footer_run = footer_p.add_run("By: Nabila Arsagita  •  Dibuat untuk belajar budaya Indonesia")
footer_run.font.size = Pt(8)
footer_run.font.color.rgb = MUTED
footer_p.add_run("\t")
page_label = footer_p.add_run("Halaman ")
page_label.font.size = Pt(8)
page_label.font.color.rgb = MUTED
add_page_field(footer_p)
for run in footer_p.runs:
    run.font.size = Pt(8)
    run.font.color.rgb = MUTED

# ---------------------------------------------------------------- sampul
band = doc.add_table(rows=1, cols=1)
band.alignment = WD_TABLE_ALIGNMENT.CENTER
band.autofit = False
remove_table_borders(band)
band.rows[0].height = Cm(0.8)
band.rows[0].height_rule = WD_ROW_HEIGHT_RULE.EXACTLY
band.cell(0, 0).width = Cm(15.6)
shade_cell(band.cell(0, 0), TEAL_HEX)

for _ in range(3):
    doc.add_paragraph()

logo_par = doc.add_paragraph()
logo_par.alignment = WD_ALIGN_PARAGRAPH.CENTER
logo_par.paragraph_format.space_after = Pt(18)
logo_par.add_run().add_picture(str(IMG / "logo.png"), width=Cm(7.4))

kicker = doc.add_paragraph()
kicker.alignment = WD_ALIGN_PARAGRAPH.CENTER
kicker.paragraph_format.space_after = Pt(4)
kr = kicker.add_run("LAPORAN PENGEMBANGAN APLIKASI")
kr.bold = True
kr.font.size = Pt(10)
kr.font.color.rgb = WARM
kr.font.name = "Calibri"

title = doc.add_paragraph()
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
title.paragraph_format.space_after = Pt(2)
tr = title.add_run("Bhinneka Tunggal Ika")
tr.bold = True
tr.font.size = Pt(34)
tr.font.name = "Cambria"
tr.font.color.rgb = TEAL

subtitle = doc.add_paragraph()
subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
subtitle.paragraph_format.space_after = Pt(10)
sr = subtitle.add_run("Petualangan Budaya Indonesia")
sr.font.size = Pt(19)
sr.font.name = "Cambria"
sr.font.color.rgb = PRIMARY

divider = doc.add_paragraph()
divider.alignment = WD_ALIGN_PARAGRAPH.CENTER
divider.paragraph_format.space_after = Pt(12)
para_bottom_border(divider, color="F2C14E", size="12")

desc = doc.add_paragraph()
desc.alignment = WD_ALIGN_PARAGRAPH.CENTER
desc.paragraph_format.space_after = Pt(28)
dr = desc.add_run(
    "Aplikasi web edukasi budaya Nusantara untuk siswa sekolah dasar:\n"
    "38 provinsi, kuis interaktif, tantangan budaya, dan mode offline."
)
dr.font.size = Pt(11)
dr.font.color.rgb = MUTED

info = doc.add_table(rows=0, cols=2)
info.alignment = WD_TABLE_ALIGNMENT.CENTER
info.autofit = False
remove_table_borders(info)
set_cell_margins(info, top=50, left=60, bottom=50, right=60)
info_rows = [
    ("Disusun oleh", "Nabila Arsagita"),
    ("Jenis dokumen", "Laporan pengembangan aplikasi"),
    ("Platform", "Web (PWA) — desktop, tablet, dan ponsel"),
    ("Teknologi", "React 19, TypeScript, Vite, Tailwind CSS, FastAPI"),
    ("Status", "Produksi — bhinneka-tunggal-ika.vercel.app"),
    ("Tahun", "2026"),
]
for label, value in info_rows:
    cells = info.add_row().cells
    cells[0].width = Cm(4.2)
    cells[1].width = Cm(11.2)
    lr = cells[0].paragraphs[0].add_run(label)
    lr.bold = True
    lr.font.size = Pt(9.5)
    lr.font.color.rgb = TEAL
    vr = cells[1].paragraphs[0].add_run(value)
    vr.font.size = Pt(9.5)
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
toc_run.font.size = Pt(17)
toc_run.font.color.rgb = TEAL
TOC_MARKER = doc.add_paragraph()
doc.add_page_break()

# ---------------------------------------------------------------- ringkasan
h1("Ringkasan Eksekutif")
p(
    "Bhinneka Tunggal Ika — Petualangan Budaya Indonesia adalah aplikasi web edukasi yang "
    "mengajak siswa sekolah dasar mengenal budaya 38 provinsi melalui peta interaktif, kuis "
    "26 soal, dan tiga permainan budaya. Antarmuka dibangun dengan React 19, TypeScript, Vite, "
    "dan Tailwind CSS, sedangkan layanan data menggunakan FastAPI dengan MongoDB sebagai "
    "penyimpanan opsional."
)
p(
    "Aplikasi telah berjalan di produksi melalui Vercel. Seluruh konten budaya bersumber dari "
    "Kemendikbud RI dan UNESCO, mencakup 228 entri budaya (6 kategori untuk masing-masing 38 "
    "provinsi). Sejak pembaruan terakhir, aplikasi juga dilengkapi kemampuan offline penuh "
    "(Progressive Web App) sehingga dapat dibuka dan dimainkan tanpa internet setelah kunjungan "
    "pertama, serta dapat dipasang di layar utama ponsel atau tablet."
)
p("Hasil utama:", bold=True, after=3)
bullets(
    [
        ("38 provinsi, 7 kelompok pulau. ", "Peta Indonesia dengan hotspot tak terlihat dan navigasi bertingkat."),
        ("228 entri budaya. ", "Rumah adat, pakaian adat, tarian, alat musik, makanan khas, serta seni dan kerajinan."),
        ("26 soal per provinsi. ", "9 pilihan ganda, 9 ya/tidak, dan 8 isian singkat, lengkap dengan penjelasan."),
        ("3 permainan budaya. ", "Jodohkan Budaya, Kartu Ingatan, dan Tebak dari Petunjuk."),
        ("Mode offline penuh. ", "66 aset inti (±3,4 MB) tersimpan melalui service worker dan dapat di-install."),
        ("Teruji. ", "11 pengujian otomatis lulus, pengujian fungsional dan offline lulus, produksi aktif."),
    ]
)

# ---------------------------------------------------------------- 1
h1("1. Pendahuluan")
h2("1.1 Latar Belakang")
p(
    "Indonesia memiliki kekayaan budaya yang sangat beragam, dari Sabang sampai Merauke. "
    "Setiap provinsi memiliki rumah adat, pakaian adat, tarian, alat musik, makanan khas, serta "
    "seni dan kerajinan yang khas. Namun, materi budaya sering disajikan dalam bentuk teks yang "
    "padat sehingga kurang menarik bagi siswa sekolah dasar."
)
p(
    "Di sisi lain, tidak semua sekolah memiliki koneksi internet yang stabil. Pembelajaran "
    "berbasis web berisiko tidak dapat digunakan ketika jaringan terputus. Karena itu, aplikasi "
    "ini dirancang tidak hanya menarik dan mudah dipakai, tetapi juga tetap berfungsi saat "
    "perangkat sedang offline."
)

h2("1.2 Tujuan")
bullets(
    [
        "Menyediakan media belajar budaya Indonesia yang ramah anak dan menyenangkan.",
        "Mencakup seluruh 38 provinsi dalam 7 kelompok pulau tanpa data yang dibuat-buat.",
        "Menguji pemahaman siswa melalui kuis 26 soal dan tiga permainan budaya.",
        "Menyimpan progres belajar secara persisten di perangkat siswa.",
        "Memungkinkan aplikasi dibuka dan dimainkan tanpa internet setelah kunjungan pertama.",
    ]
)

h2("1.3 Manfaat")
rich([("Bagi siswa: ", True), ("belajar budaya sambil bermain, dengan bahasa sederhana dan umpan balik langsung.", False)], style="List Bullet")
rich([("Bagi guru: ", True), ("menjadi media pendamping pembelajaran IPS dan muatan lokal yang siap pakai.", False)], style="List Bullet")
rich([("Bagi orang tua: ", True), ("aktivitas belajar yang aman, tanpa iklan, tanpa pendaftaran, dan bisa dipakai offline.", False)], style="List Bullet")

h2("1.4 Sasaran Pengguna")
p(
    "Sasaran utama adalah siswa sekolah dasar kelas 3–6 (usia 8–12 tahun). Aplikasi juga dapat "
    "digunakan guru di kelas dan orang tua di rumah. Perangkat yang didukung mencakup laptop, "
    "tablet, dan ponsel dengan browser modern (Chrome, Edge, Safari, atau Firefox)."
)

h2("1.5 Istilah penting")
p("Beberapa istilah teknis yang muncul dalam laporan ini, beserta artinya dalam bahasa sehari-hari.")
table(
    ["Istilah", "Arti sederhana"],
    [
        ["Aplikasi web", "Program yang dibuka lewat browser, tanpa perlu diunduh dari toko aplikasi."],
        ["PWA (Progressive Web App)", "Aplikasi web yang bisa dipasang di layar utama dan dipakai tanpa internet."],
        ["Service worker", "Mesin di balik layar yang menyimpan berkas aplikasi agar bisa dipakai offline."],
        ["Cache", "Penyimpanan sementara di perangkat agar halaman cepat dimuat."],
        ["API / layanan data", "Jembatan antara aplikasi dan server yang menyediakan data budaya."],
        ["localStorage", "Penyimpanan kecil di perangkat untuk menyimpan progres pemain."],
        ["Build", "Proses mengubah kode menjadi aplikasi siap pakai."],
        ["Deploy", "Mengunggah aplikasi ke server agar bisa diakses publik."],
        ["Hotspot", "Titik tak terlihat pada peta yang dapat diklik untuk membuka provinsi."],
        ["Offline", "Kondisi ketika perangkat tidak terhubung ke internet."],
    ],
    widths=[5.0, 11.0],
    font_size=9.5,
)

# ---------------------------------------------------------------- 2
h1("2. Gambaran Umum Aplikasi")
h2("2.1 Deskripsi Singkat")
p(
    "Aplikasi terdiri atas satu alur utama: siswa membuka beranda, memilih wilayah pada peta "
    "Indonesia, memilih provinsi, lalu mempelajari budaya provinsi tersebut atau mengerjakan "
    "kuis. Selain itu tersedia Tantangan Budaya, Profil, Pencapaian, dan Pengaturan. Seluruh "
    "antarmuka dan alamat halaman menggunakan bahasa Indonesia."
)
figure("01-beranda.png", "Gambar 1. Tampilan beranda dengan ajakan mulai menjelajah dan pintasan Tantangan Budaya.")

h2("2.2 Fitur Utama")
table(
    ["Fitur", "Deskripsi"],
    [
        ["Peta Nusantara", "7 kelompok pulau dan 38 provinsi dengan hotspot yang tak terlihat tetapi dapat diklik."],
        ["Halaman provinsi", "Enam kategori budaya: rumah adat, pakaian adat, tarian, alat musik, makanan, serta seni dan kerajinan."],
        ["Kuis 26 soal", "9 pilihan ganda, 9 ya/tidak, dan 8 isian singkat dengan penjelasan sebelum mulai."],
        ["Tantangan Budaya", "Jodohkan Budaya, Kartu Ingatan, dan Tebak dari Petunjuk."],
        ["Profil dan progres", "Level, XP, bintang, dan riwayat kuis yang tersimpan di perangkat."],
        ["Pencapaian", "Enam lencana yang terbuka berdasarkan jumlah bintang."],
        ["Pengaturan", "Musik latar, efek suara, pengurangan animasi, teks lebih besar, dan koneksi server."],
        ["Mode offline (PWA)", "App shell, aset, dan musik tersimpan; aplikasi dapat dibuka tanpa internet dan di-install."],
        ["Responsif", "Tata letak menyesuaikan desktop, tablet, dan ponsel."],
        ["Bahasa Indonesia", "Seluruh teks antarmuka dan URL menggunakan bahasa Indonesia."],
    ],
    widths=[4.2, 11.4],
)
caption("Tabel 1. Fitur utama aplikasi.")

h2("2.3 Alur Penggunaan")
bullets(
    [
        ("Beranda. ", "Menampilkan sapaan, tombol mulai, pintasan tantangan, dan ringkasan progres."),
        ("Peta. ", "Siswa memilih salah satu dari tujuh kelompok pulau."),
        ("Pulau. ", "Daftar provinsi pada kelompok pulau tersebut ditampilkan."),
        ("Provinsi. ", "Siswa membaca enam kategori budaya, lalu memilih mulai kuis."),
        ("Kuis atau Tantangan. ", "Siswa menjawab soal atau memainkan permainan budaya."),
        ("Profil dan Pencapaian. ", "Progres, XP, bintang, riwayat, dan lencana dapat dilihat kembali."),
    ],
    numbered=True,
)
figure("02-peta.png", "Gambar 2. Peta Indonesia dengan tujuh kelompok pulau dan hotspot tak terlihat.")
figure("03-pulau.png", "Gambar 3. Halaman kelompok pulau yang menampilkan daftar provinsi.")

h2("2.4 Ruang Lingkup")
p(
    "Ruang lingkup aplikasi mencakup 38 provinsi, 228 entri budaya, 26 soal kuis untuk setiap "
    "provinsi, tiga permainan budaya, sistem progres berbasis localStorage, serta dukungan "
    "offline penuh. Aplikasi tidak memungut data pribadi dan tidak memerlukan akun."
)

# ---------------------------------------------------------------- 3
h1("3. Desain dan Pengalaman Pengguna")
h2("3.1 Prinsip Desain")
p(
    "Desain diarahkan pada gaya kartun 2D yang ramah anak, tetapi tetap terkendali agar tidak "
    "terkesan berlebihan. Prinsip yang dipakai adalah palet warna terbatas, ikon yang konsisten, "
    "sedikit gradien dan emoji, serta hierarki tipografi yang jelas. Tujuannya adalah tampilan "
    "yang hangat dan mudah dibaca, bukan sekadar ramai."
)
bullets(
    [
        "Sederhana: satu tujuan utama per layar dan tombol aksi yang jelas.",
        "Konsisten: ikon Lucide, sudut membulat, dan pola kartu yang sama di seluruh halaman.",
        "Ramah anak: bahasa pendek, sapaan personal, dan umpan balik positif.",
        "Tenang: warna bumi Nusantara, bukan warna neon yang menyilaukan.",
        "Aksesibel: kontras cukup, label ARIA, serta opsi kurangi animasi dan teks lebih besar.",
    ]
)

h2("3.2 Palet Warna")
p(
    "Palet “Nusantara Modern” mengambil inspirasi dari warna tanah, rempah, dan laut Indonesia. "
    "Warna utama dipakai untuk aksi, sedangkan warna netral hangat dipakai sebagai latar."
)
palette = [
    ("Merah Nusantara", "#D94A36", "Tombol utama, aksen penting", "D94A36", "FFFFFF"),
    ("Oranye Hangat", "#F28C28", "Sorotan, bintang, elemen ceria", "F28C28", "352B27"),
    ("Kuning Kunyit", "#F2C14E", "Lencana dan aksen lembut", "F2C14E", "352B27"),
    ("Teal Laut", "#247C83", "Header, navigasi, tautan", "247C83", "FFFFFF"),
    ("Hijau Daun", "#477A52", "Jawaban benar dan status berhasil", "477A52", "FFFFFF"),
    ("Biru Langit", "#78A9B5", "Elemen sekunder dan grafik", "78A9B5", "352B27"),
    ("Krem Ivory", "#FFF5E8", "Latar halaman yang hangat", "FFF5E8", "352B27"),
    ("Cokelat Tanah", "#352B27", "Teks utama", "352B27", "FFFFFF"),
]
pal_tbl = doc.add_table(rows=1, cols=3)
pal_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
pal_tbl.autofit = False
set_table_borders(pal_tbl)
set_cell_margins(pal_tbl)
pal_widths = [4.4, 3.2, 8.0]
for i, w in enumerate(pal_widths):
    pal_tbl.columns[i].width = Cm(w)
for i, text in enumerate(["Warna", "Kode", "Penggunaan"]):
    cell = pal_tbl.rows[0].cells[i]
    cell.width = Cm(pal_widths[i])
    shade_cell(cell, TEAL_HEX)
    run = cell.paragraphs[0].add_run(text)
    run.bold = True
    run.font.size = Pt(9.5)
    run.font.color.rgb = WHITE
repeat_header(pal_tbl.rows[0])
for name, hex_code, usage, fill, text_color in palette:
    cells = pal_tbl.add_row().cells
    for i, w in enumerate(pal_widths):
        cells[i].width = Cm(w)
    shade_cell(cells[0], fill)
    run = cells[0].paragraphs[0].add_run(name)
    run.bold = True
    run.font.size = Pt(9.5)
    run.font.color.rgb = RGBColor.from_string(text_color)
    run2 = cells[1].paragraphs[0].add_run(hex_code)
    run2.font.size = Pt(9.5)
    run3 = cells[2].paragraphs[0].add_run(usage)
    run3.font.size = Pt(9.5)
for pal_row in pal_tbl.rows:
    for pal_cell in pal_row.cells:
        for pal_par in pal_cell.paragraphs:
            pal_par.paragraph_format.keep_with_next = True
pal_spacer = doc.add_paragraph()
pal_spacer.paragraph_format.space_after = Pt(2)
pal_spacer.paragraph_format.keep_with_next = True
caption("Tabel 2. Palet warna “Nusantara Modern” beserta penggunaannya.")

h2("3.3 Tipografi")
p(
    "Dua jenis huruf digunakan: Baloo 2 untuk judul dan angka besar karena bentuknya bulat dan "
    "ramah, serta Nunito untuk teks isi karena mudah dibaca dalam ukuran kecil. Ukuran teks isi "
    "dapat diperbesar melalui Pengaturan."
)

h2("3.4 Navigasi dan Alamat Halaman")
p(
    "Navigasi utama memakai peta dan breadcrumb. Di layar kecil, bilah navigasi bawah "
    "menampilkan Beranda, Peta, Tantangan, Profil, dan Pengaturan. Alamat halaman menggunakan "
    "bahasa Indonesia agar mudah diingat:"
)
bullets(
    [
        ("/peta ", "— peta Indonesia"),
        ("/pulau/:region ", "— daftar provinsi per kelompok pulau"),
        ("/provinsi/:id ", "— budaya dan kuis provinsi"),
        ("/kuis/:id ", "— kuis 26 soal"),
        ("/tantangan, /tantangan/jodohkan, /tantangan/ingatan, /tantangan/petunjuk ", "— permainan budaya"),
        ("/profil, /pencapaian, /pengaturan ", "— progres dan pengaturan"),
    ]
)

h2("3.5 Responsivitas")
p(
    "Tata letak diuji pada lebar desktop (1440 px), tablet, dan ponsel (390 px). Kartu, peta, "
    "dan tombol menyesuaikan ukuran tanpa kehilangan fungsi. Bilah navigasi bawah hanya muncul "
    "pada layar kecil."
)
figure_pair_mobile(
    "16-mobile-beranda.png",
    "17-mobile-peta.png",
    "Gambar 4 dan 5. Tampilan beranda dan peta pada layar ponsel (390 × 844 px).",
)

h2("3.6 Aksesibilitas")
bullets(
    [
        "Label ARIA pada tombol ikon, progres, skor, dan elemen penting.",
        "Dukungan pengurangan animasi dan teks lebih besar melalui Pengaturan.",
        "Kontras teks utama terhadap latar krem dijaga pada tingkat yang nyaman dibaca.",
        "Navigasi dapat dilakukan dengan keyboard; fokus tombol terlihat jelas.",
        "Umpan balik jawaban tidak hanya mengandalkan warna, tetapi juga ikon dan teks.",
    ]
)

# ---------------------------------------------------------------- 4
h1("4. Konten Budaya dan Pembelajaran")
h2("4.1 Cakupan Wilayah")
p(
    "Seluruh 38 provinsi Indonesia dikelompokkan ke dalam tujuh wilayah pulau. Pembagian ini "
    "memudahkan siswa menjelajah dari wilayah besar ke provinsi."
)
table(
    ["Kelompok Pulau", "Jumlah Provinsi"],
    [
        ["Pulau Sumatra", "10"],
        ["Pulau Jawa", "6"],
        ["Pulau Kalimantan", "5"],
        ["Pulau Sulawesi", "6"],
        ["Bali & Nusa Tenggara", "3"],
        ["Kepulauan Maluku", "2"],
        ["Pulau Papua", "6"],
        ["Total", "38"],
    ],
    widths=[10.0, 5.0],
    align_center=[1],
)
caption("Tabel 3. Sebaran 38 provinsi pada tujuh kelompok pulau.")

h2("4.2 Struktur Data Budaya")
p(
    "Setiap provinsi memiliki enam entri budaya, sehingga totalnya 228 entri. Setiap entri "
    "memuat nama, deskripsi singkat, kategori, dan sumber. Kategori yang dipakai adalah rumah "
    "adat, pakaian adat, tarian, alat musik, makanan khas, serta seni dan kerajinan."
)
figure("04-provinsi.png", "Gambar 6. Halaman provinsi Bali dengan enam kategori budaya dan sumbernya.")

h2("4.3 Sumber Data")
p(
    "Konten budaya tidak dibuat-buat. Data disusun dari sumber rujukan yang dapat "
    "dipertanggungjawabkan dan dicantumkan pada setiap entri."
)
table(
    ["Sumber", "Jumlah Entri", "Keterangan"],
    [
        ["Kemendikbud RI", "221", "Rujukan utama rumah adat, pakaian, tarian, musik, makanan, dan kerajinan."],
        ["UNESCO", "6", "Penetapan warisan budaya, antara lain Tari Kecak dan wayang."],
        ["UNESCO ICH", "1", "Warisan budaya takbenda yang terkait dengan seni pertunjukan."],
        ["Total", "228", "Enam kategori untuk 38 provinsi."],
    ],
    widths=[4.0, 3.0, 8.6],
    align_center=[1],
)
caption("Tabel 4. Sumber data budaya pada aplikasi.")

h2("4.4 Kuis 26 Soal")
p(
    "Setiap provinsi memiliki 26 soal dengan komposisi tetap. Sebelum mulai, siswa melihat "
    "penjelasan cara bermain, jumlah soal per jenis, aturan penilaian, dan materi yang akan "
    "dipelajari. Setelah menjawab, siswa langsung mendapat umpan balik dan penjelasan singkat."
)
table(
    ["Jenis Soal", "Jumlah", "Cara Menjawab", "Penilaian"],
    [
        ["Pilihan ganda", "9", "Pilih satu dari beberapa opsi.", "Cocok persis dengan kunci."],
        ["Ya / Tidak", "9", "Pilih “Ya” atau “Tidak”.", "Cocok persis dengan kunci."],
        ["Isian singkat", "8", "Tulis jawaban singkat (maks. 200 karakter).", "Mengandung salah satu kata kunci."],
        ["Total", "26", "—", "1 poin per jawaban benar."],
    ],
    widths=[3.4, 2.2, 6.4, 4.6],
    align_center=[1],
)
caption("Tabel 5. Komposisi soal kuis untuk setiap provinsi.")
figure("06-kuis-intro.png", "Gambar 7. Halaman penjelasan sebelum kuis dimulai.")
figure("07-kuis-soal.png", "Gambar 8. Soal pilihan ganda dengan progres dan indikator skor.")
figure("08-kuis-jawaban.png", "Gambar 9. Umpan balik setelah menjawab, disertai penjelasan singkat.")
p(
    "Penilaian akhir memakai skala bintang: tiga bintang bila skor mencapai 80% atau lebih, dua "
    "bintang bila mencapai 60%, dan satu bintang bila di bawah 60%. Setiap jawaban benar "
    "memberi 10 XP."
)

h2("4.5 Tantangan Budaya")
p(
    "Tiga permainan singkat melengkapi kuis dan membantu siswa mengingat materi melalui cara "
    "yang berbeda. Seluruh permainan memakai data lokal sehingga tetap berjalan tanpa internet."
)
table(
    ["Permainan", "Cara Bermain"],
    [
        ["Jodohkan Budaya", "Menebak provinsi asal dari rumah adat, tarian, atau makanan yang muncul."],
        ["Kartu Ingatan", "Membalik kartu dan memasangkan nama budaya dengan provinsi asalnya."],
        ["Tebak dari Petunjuk", "Membaca ciri-ciri budaya, lalu menebak nama budaya yang dimaksud."],
    ],
    widths=[4.4, 11.2],
)
caption("Tabel 6. Tiga permainan pada Tantangan Budaya.")
figure("05-tantangan.png", "Gambar 10. Menu Tantangan Budaya dengan tiga pilihan permainan.")
figure("15-tantangan-jodohkan.png", "Gambar 11. Permainan Jodohkan Budaya.")

h2("4.6 Gamifikasi dan Progres")
p(
    "Progres pemain disimpan di localStorage dengan kunci bti-player, sehingga tetap ada saat "
    "aplikasi ditutup. Data yang disimpan mencakup nama panggilan, avatar, level, XP, bintang, "
    "riwayat kuis, serta preferensi tampilan. Enam lencana tersedia berdasarkan jumlah bintang: "
    "1, 3, 5, 8, 12, dan 20 bintang."
)
figure("10-profil.png", "Gambar 12. Halaman profil dengan level, XP, bintang, dan riwayat kuis.")
figure("11-pencapaian.png", "Gambar 13. Halaman pencapaian dengan lencana budaya.")
figure("12-pengaturan.png", "Gambar 14. Halaman pengaturan profil, tampilan, data, dan koneksi server.")

# ---------------------------------------------------------------- 5
h1("5. Arsitektur dan Teknologi")
h2("5.1 Teknologi yang Digunakan")
table(
    ["Bagian", "Teknologi", "Peran"],
    [
        ["Antarmuka", "React 19.3 + TypeScript 7.0", "Komponen halaman dan tipe data."],
        ["Build", "Vite 8.3", "Pengembangan, build produksi, dan preview."],
        ["Gaya", "Tailwind CSS 4.3", "Utilitas tata letak dan tema warna."],
        ["Navigasi", "React Router 7.18", "Rute bahasa Indonesia dan lazy loading."],
        ["Data klien", "TanStack Query 5.107", "Pengambilan data dan cache permintaan."],
        ["State", "Zustand 5.1 + persist", "Progres pemain di localStorage."],
        ["Ikon", "Lucide React", "Ikon konsisten di seluruh aplikasi."],
        ["Layanan data", "FastAPI 0.115+", "Endpoint provinsi, budaya, kuis, dan pemain."],
        ["Basis data", "Motor 3.5+ / MongoDB Atlas", "Penyimpanan opsional untuk progres dan hasil kuis."],
        ["Hosting", "Vercel", "Frontend dan API dalam satu platform."],
        ["Offline", "Service worker kustom + Web App Manifest", "Precache aset dan instalasi PWA."],
    ],
    widths=[3.2, 5.6, 6.8],
)
caption("Tabel 7. Teknologi utama pada aplikasi.")

h2("5.2 Struktur Proyek")
table(
    ["Lokasi", "Isi"],
    [
        ["frontend/src/pages", "Halaman beranda, peta, pulau, provinsi, kuis, tantangan, profil, pencapaian, pengaturan."],
        ["frontend/src/components", "Komponen UI, layout, navigasi, musik, dan permainan."],
        ["frontend/src/data", "38 provinsi, 228 entri budaya, dan generator kuis lokal."],
        ["frontend/src/store", "State pemain dengan persistensi localStorage."],
        ["frontend/src/lib", "Klien API, suara, dan util."],
        ["frontend/scripts/generate-sw.mjs", "Pembuat service worker saat build."],
        ["frontend/public", "Aset WebP, manifest, ikon, dan berkas statis."],
        ["backend/app/routers", "Endpoint provinsi, budaya, kuis, pemain, dan kesehatan."],
        ["backend/app/data", "Data budaya dan provinsi di sisi server."],
    ],
    widths=[5.6, 10.0],
)
caption("Tabel 8. Struktur direktori utama.")

h2("5.3 Alur Data")
bullets(
    [
        ("Permintaan data. ", "Frontend memanggil API melalui VITE_API_BASE_URL atau alamat yang diatur di Pengaturan."),
        ("Fallback lokal. ", "Bila API gagal, halaman provinsi memakai cultures.json dan kuis memakai generator lokal."),
        ("Penyimpanan progres. ", "Level, XP, bintang, dan riwayat disimpan di localStorage; API dipakai bila tersedia."),
        ("Basis data opsional. ", "Tanpa MONGO_URL, API tetap berjalan dan progres tetap aman di perangkat."),
    ],
    numbered=True,
)

h2("5.4 Privasi dan Keamanan")
p(
    "Aplikasi tidak meminta pendaftaran, email, atau nomor telepon. Nama panggilan dan avatar "
    "bersifat lokal dan dapat diubah kapan saja. Tidak ada iklan maupun pelacakan pihak ketiga. "
    "Pengaturan menyediakan tombol reset progres yang harus dikonfirmasi terlebih dahulu."
)

# ---------------------------------------------------------------- 6
h1("6. Mode Offline (PWA)")
h2("6.1 Kebutuhan")
p(
    "Banyak sekolah dan rumah di Indonesia belum memiliki koneksi internet yang stabil. Tanpa "
    "dukungan offline, aplikasi web tidak dapat dibuka ketika jaringan terputus. Karena itu, "
    "aplikasi diubah menjadi Progressive Web App (PWA) yang menyimpan seluruh kebutuhan "
    "tampilannya di perangkat."
)
callout(
    "Prinsip utama",
    "Kunjungan pertama tetap memerlukan internet untuk mengunduh aplikasi (±3,4 MB). Setelah itu, "
    "aplikasi dapat dibuka, di-install, dan dimainkan tanpa internet.",
)

h2("6.2 Service Worker")
p(
    "Service worker dibuat otomatis saat build oleh scripts/generate-sw.mjs. Skrip ini memindai "
    "folder dist, menghitung revisi setiap berkas, lalu menuliskan daftar precache ke dist/sw.js. "
    "Pada build terakhir, 66 aset inti tersimpan, termasuk berkas HTML, JavaScript, CSS, gambar "
    "WebP, ikon, dan musik latar berukuran ±2 MB."
)
table(
    ["Jenis Permintaan", "Strategi", "Nama Cache"],
    [
        ["Navigasi halaman", "Network-first, fallback ke /index.html", "bti-<versi>"],
        ["Aset same-origin (JS, CSS, gambar, audio)", "Cache-first", "bti-<versi>"],
        ["Font Google", "Cache-first", "bti-fonts"],
        ["Endpoint /api/", "Network-only (aplikasi punya fallback lokal)", "—"],
    ],
    widths=[6.0, 6.6, 3.0],
)
caption("Tabel 9. Strategi cache pada service worker.")

h2("6.3 Manifest dan Instalasi")
p(
    "Manifest web memuat nama aplikasi, nama pendek “Bhinneka”, warna tema teal, latar krem, "
    "mode standalone, serta ikon 192 px, 512 px, dan ikon maskable 512 px. Tersedia pula ikon "
    "Apple Touch 180 px. Dengan berkas ini, aplikasi dapat dipasang ke layar utama tanpa "
    "menggunakan toko aplikasi."
)

h2("6.4 Perilaku Saat Offline")
table(
    ["Fitur", "Saat Online", "Saat Offline"],
    [
        ["Beranda, peta, navigasi", "Muat dari jaringan", "Muat dari cache service worker"],
        ["Halaman provinsi", "Data dari API", "cultures.json + banner “Mode offline”"],
        ["Kuis 26 soal", "Data dari API", "Generator kuis lokal"],
        ["Tantangan Budaya", "Data lokal", "Data lokal"],
        ["Progres, XP, bintang", "localStorage + API", "localStorage"],
        ["Musik dan gambar", "Jaringan atau cache", "Cache service worker"],
        ["Pengiriman skor ke server", "Dikirim ke API", "Dilewati, skor tetap tersimpan lokal"],
    ],
    widths=[5.2, 4.8, 5.6],
)
caption("Tabel 10. Perilaku aplikasi saat online dan offline.")

h2("6.5 Pembaruan dan Pembersihan Cache")
p(
    "Nama cache memakai hash versi dari seluruh aset. Saat ada versi baru, service worker "
    "mengunduh aset baru, mengambil alih halaman, lalu memuat ulang sekali agar siswa memakai "
    "versi terbaru. Cache versi lama dihapus otomatis pada tahap aktivasi agar penyimpanan tidak "
    "menumpuk."
)

h2("6.6 Batasan")
bullets(
    [
        "Kunjungan pertama wajib online untuk mengunduh app shell dan aset.",
        "Font Google memakai font cadangan sistem bila belum pernah tersimpan.",
        "Data API yang belum pernah dimuat tidak tersedia saat offline; aplikasi memakai data lokal.",
        "Menghapus data situs atau cache akan menghapus mode offline dan progres lokal.",
        "Skor kuis saat offline tidak dikirim ke server, tetapi tetap tersimpan di perangkat.",
    ]
)

h2("6.7 Cara Menguji")
bullets(
    [
        "Buka aplikasi dengan internet, tunggu 10–20 detik, lalu jelajahi beberapa halaman.",
        "Pasang aplikasi melalui menu browser (Install app / Add to Home Screen).",
        "Matikan Wi-Fi dan data seluler, lalu buka aplikasi dari ikon.",
        "Pastikan banner “Kamu sedang offline” muncul dan halaman provinsi menampilkan data lokal.",
        "Di desktop, pengujian dapat dilakukan melalui DevTools → Network → Offline.",
    ],
    numbered=True,
)
figure("13-offline-beranda.png", "Gambar 15. Beranda saat offline; banner status muncul di bagian atas.")
figure("14-offline-provinsi.png", "Gambar 16. Halaman provinsi saat offline dengan data budaya lokal.")

# ---------------------------------------------------------------- 7
h1("7. Pengujian dan Hasil")
h2("7.1 Lingkungan Pengujian")
table(
    ["Komponen", "Keterangan"],
    [
        ["Sistem operasi", "Windows 11"],
        ["Runtime", "Node.js 24.x dan Python 3.x"],
        ["Browser uji", "Chromium melalui Playwright"],
        ["Build", "npm run build (tsc -b, vite build, generate-sw.mjs)"],
        ["Pengujian otomatis", "Vitest 5.1"],
        ["Lingkungan produksi", "Vercel (frontend dan API)"],
    ],
    widths=[5.0, 10.6],
)
caption("Tabel 11. Lingkungan pengujian.")

h2("7.2 Pengujian Otomatis")
p(
    "Terdapat 11 pengujian otomatis dalam tiga berkas: localData.test.ts, provinces.test.ts, dan "
    "tantangan.test.ts. Pengujian memeriksa kelengkapan 38 provinsi, konsistensi 228 entri "
    "budaya, komposisi kuis 26 soal, serta logika permainan budaya. Seluruh pengujian lulus."
)
callout(
    "Hasil",
    "Test Files 3 passed (3)  •  Tests 11 passed (11)  •  Build produksi berhasil dengan 66 aset "
    "di-precache.",
    fill="EDF6F4",
    border="477A52",
)

h2("7.3 Pengujian Fungsional")
table(
    ["No", "Skenario", "Hasil"],
    [
        ["1", "Peta menampilkan 7 kelompok pulau dan 38 provinsi", "Lulus"],
        ["2", "Hotspot peta tak terlihat tetapi dapat diklik", "Lulus"],
        ["3", "Halaman provinsi menampilkan enam kategori budaya", "Lulus"],
        ["4", "Kuis 26 soal dengan umpan balik dan penjelasan", "Lulus"],
        ["5", "Isian singkat dinilai berdasarkan kata kunci", "Lulus"],
        ["6", "Skor, bintang, dan XP dihitung dengan benar", "Lulus"],
        ["7", "Tiga permainan Tantangan Budaya berjalan", "Lulus"],
        ["8", "Progres tersimpan setelah halaman ditutup", "Lulus"],
        ["9", "Reload dan navigasi saat offline", "Lulus"],
        ["10", "Manifest dan service worker terpasang", "Lulus"],
        ["11", "Tampilan responsif di ponsel", "Lulus"],
        ["12", "URL dan antarmuka berbahasa Indonesia", "Lulus"],
    ],
    widths=[1.2, 11.6, 2.8],
    align_center=[0, 2],
)
caption("Tabel 12. Ringkasan pengujian fungsional.")

h2("7.4 Pengujian Kuis")
p(
    "Untuk memverifikasi alur penilaian, kuis Bali dikerjakan otomatis dengan menjawab seluruh "
    "soal sesuai kunci jawaban. Hasilnya 26 dari 26 jawaban benar, skor 100%, tiga bintang, dan "
    "+260 XP. Seluruh soal isian singkat juga cocok dengan kata kunci."
)
table(
    ["Jenis Soal", "Benar", "Total"],
    [
        ["Pilihan ganda", "9", "9"],
        ["Ya / Tidak", "9", "9"],
        ["Isian singkat", "8", "8"],
        ["Total", "26", "26"],
    ],
    widths=[8.0, 3.8, 3.8],
    align_center=[1, 2],
)
caption("Tabel 13. Rincian hasil pengujian kuis Bali.")
figure("09-kuis-hasil.png", "Gambar 17. Halaman hasil kuis: 26/26, 100% benar, tiga bintang, dan +260 XP.")

h2("7.5 Pengujian Offline")
p(
    "Pengujian dilakukan pada situs produksi. Setelah service worker aktif dan cache terisi, "
    "jaringan dimatikan melalui browser. Beranda dimuat ulang dan halaman provinsi dibuka "
    "langsung dari alamatnya. Keduanya tampil normal, lengkap dengan banner offline dan data "
    "budaya lokal."
)
bullets(
    [
        ("Cache terisi. ", "66 aset inti tersimpan; pengujian mencatat 69 entri termasuk font."),
        ("Reload offline. ", "Beranda tampil dari cache service worker."),
        ("Navigasi offline. ", "/provinsi/bali tampil dengan 6 entri budaya dan banner “Mode offline”."),
        ("Kuis offline. ", "/kuis/bali menampilkan 26 soal dari generator lokal."),
    ]
)

h2("7.6 Pengujian Produksi")
table(
    ["Item", "Alamat", "Status"],
    [
        ["Frontend", "bhinneka-tunggal-ika.vercel.app", "200 OK"],
        ["API health", "bhinneka-tunggal-ika-api.vercel.app/api/health", "200 OK"],
        ["Service worker", "/sw.js", "200, Cache-Control: max-age=0, must-revalidate"],
        ["Manifest", "/manifest.webmanifest", "200, application/manifest+json"],
    ],
    widths=[3.4, 7.0, 5.2],
)
caption("Tabel 14. Hasil pemeriksaan produksi.")

h2("7.7 Ringkasan Hasil")
p(
    "Seluruh pengujian utama lulus: build produksi berhasil, 11 pengujian otomatis lulus, alur "
    "kuis 26 soal berjalan benar, mode offline berfungsi, dan situs produksi aktif. Tidak ada "
    "sisa fitur yang sudah dihapus pada aplikasi, URL, repositori, maupun domain."
)

# ---------------------------------------------------------------- 8
h1("8. Deployment dan Pemeliharaan")
h2("8.1 Infrastruktur")
p(
    "Frontend dan API dideploy terpisah pada Vercel, dengan repositori GitHub sebagai sumber "
    "utama. Frontend berupa situs statis hasil build Vite, sedangkan API berupa fungsi "
    "serverless FastAPI. Basis data MongoDB bersifat opsional."
)

h2("8.2 URL dan Repositori")
table(
    ["Layanan", "Alamat"],
    [
        ["Aplikasi", "https://bhinneka-tunggal-ika.vercel.app"],
        ["API", "https://bhinneka-tunggal-ika-api.vercel.app"],
        ["Repositori", "https://github.com/zidan-herlangga/bhinneka-tunggal-ika"],
    ],
    widths=[3.6, 12.0],
)
caption("Tabel 15. Alamat layanan produksi.")

h2("8.3 Variabel Lingkungan")
bullets(
    [
        ("VITE_API_BASE_URL ", "— alamat API yang dipakai frontend saat build."),
        ("MONGO_URL ", "— opsional; bila kosong, progres disimpan di localStorage."),
        ("CORS_ORIGINS ", "— daftar domain yang diizinkan mengakses API."),
    ]
)

h2("8.4 Proses Rilis")
bullets(
    [
        "Perubahan di-push ke branch main pada GitHub.",
        "Vercel menjalankan build frontend: TypeScript, Vite, lalu generate-sw.mjs.",
        "Service worker baru diterbitkan bersama aset dengan nama cache versi baru.",
        "Pengguna yang sedang online menerima pembaruan dan halaman dimuat ulang sekali.",
    ],
    numbered=True,
)

h2("8.5 Pemeliharaan")
bullets(
    [
        "Perbarui data budaya di frontend/src/data/cultures.json dan backend/app/data.",
        "Jalankan npm run build dan npm run test sebelum merilis perubahan.",
        "Pastikan service worker memakai nama cache baru agar pengguna menerima aset terbaru.",
        "Pantau /api/health dan halaman utama setelah deployment.",
        "Jangan menghapus alias domain tanpa memastikan domain pengganti sudah aktif.",
    ]
)

h2("8.6 Catatan Operasional")
p(
    "Project Vercel memakai Root Directory frontend. Deploy manual harus dijalankan dari akar "
    "repositori, bukan dari dalam folder frontend, agar build tidak gagal. Alias domain lama "
    "telah dihapus dan sekarang mengembalikan status 404."
)

# ---------------------------------------------------------------- 9
h1("9. Kendala dan Solusi")
table(
    ["Kendala", "Dampak", "Solusi"],
    [
        ["Kebijakan Application Control Windows memblokir binary native Rollup/Workbox.",
         "Plugin PWA berbasis Workbox gagal saat build di komputer pengembangan.",
         "Service worker ditulis manual melalui scripts/generate-sw.mjs tanpa Workbox."],
        ["Header Vary: Origin pada aset Vite.",
         "JavaScript dan CSS gagal dimuat saat offline meskipun sudah tersimpan.",
         "Pencocokan cache memakai opsi ignoreVary: true."],
        ["Deploy manual dari subfolder frontend.",
         "Vercel menolak dengan pesan “Root Directory does not exist”.",
         "Deploy dijalankan dari akar repositori; Root Directory tetap frontend."],
        ["Alias domain lama masih aktif.",
         "Domain lama kembali menampilkan aplikasi (status 200).",
         "Alias dihapus; domain lama sekarang 404."],
        ["Backend serverless dapat tidur atau tidak terjangkau.",
         "Data budaya dan kuis gagal dimuat.",
         "Fallback cultures.json, generator kuis lokal, dan banner mode offline."],
        ["Risiko data budaya tidak akurat.",
         "Konten tidak dapat dipertanggungjawabkan.",
         "Data bersumber Kemendikbud RI dan UNESCO; 228 entri divalidasi."],
    ],
    widths=[5.2, 5.2, 5.2],
)
caption("Tabel 16. Kendala teknis dan solusinya.")

# ---------------------------------------------------------------- 10
h1("10. Kesimpulan dan Saran")
h2("10.1 Kesimpulan")
bullets(
    [
        "Aplikasi berhasil mencakup 38 provinsi dan 228 entri budaya dengan sumber yang jelas.",
        "Kuis 26 soal dan tiga permainan budaya berjalan sesuai rancangan dan teruji.",
        "Progres belajar tersimpan konsisten dan dapat direset dengan aman.",
        "Mode offline penuh membuat aplikasi tetap dapat dibuka dan dimainkan tanpa internet.",
        "Aplikasi telah aktif di produksi, responsif, dan bebas dari fitur yang sudah dihapus.",
    ]
)

h2("10.2 Saran Pengembangan")
bullets(
    [
        ("Narasi audio. ", "Tambahkan pembacaan teks dan pelafalan nama budaya untuk siswa yang belum lancar membaca."),
        ("Bank soal lebih variatif. ", "Acak soal dan tambahkan tingkat kesulitan agar pengulangan terasa baru."),
        ("Mode guru. ", "Sediakan ringkasan hasil kelas dan lembar kerja cetak."),
        ("Sinkronisasi opsional. ", "Simpan progres ke akun guru atau orang tua bila diinginkan, tanpa mewajibkan login."),
        ("Konten tambahan. ", "Tambahkan bahasa daerah, permainan musik, dan peta interaktif yang lebih rinci."),
        ("Aksesibilitas lanjutan. ", "Dukungan pembaca layar yang lebih lengkap dan mode kontras tinggi."),
    ]
)

# ---------------------------------------------------------------- daftar gambar/tabel
h1("Lampiran B. Glosarium Istilah Teknis", page_break=True)
table(
    ["Istilah", "Arti sederhana"],
    [
        ["Aplikasi web", "Program yang dibuka lewat browser, tanpa perlu diunduh dari toko aplikasi."],
        ["PWA", "Aplikasi web yang bisa dipasang di layar utama dan dipakai tanpa internet."],
        ["Service worker", "Mesin di balik layar yang menyimpan berkas aplikasi agar bisa dipakai offline."],
        ["Cache", "Penyimpanan sementara di perangkat agar halaman cepat dimuat."],
        ["API / layanan data", "Jembatan antara aplikasi dan server yang menyediakan data budaya."],
        ["localStorage", "Penyimpanan kecil di perangkat untuk menyimpan progres pemain."],
        ["Build", "Proses mengubah kode menjadi aplikasi siap pakai."],
        ["Deploy", "Mengunggah aplikasi ke server agar bisa diakses publik."],
        ["Hotspot", "Titik tak terlihat pada peta yang dapat diklik untuk membuka provinsi."],
        ["Offline", "Kondisi ketika perangkat tidak terhubung ke internet."],
        ["Vercel", "Layanan hosting tempat aplikasi dan API berjalan."],
        ["WebP", "Format gambar modern yang lebih kecil dari PNG/JPEG."],
    ],
    widths=[5.0, 11.0],
    font_size=9.5,
)

h1("Daftar Gambar")
gambar = [
    "Beranda dengan ajakan mulai menjelajah dan pintasan Tantangan Budaya.",
    "Peta Indonesia dengan tujuh kelompok pulau dan hotspot tak terlihat.",
    "Halaman kelompok pulau yang menampilkan daftar provinsi.",
    "Tampilan beranda pada layar ponsel (390 × 844 px).",
    "Tampilan peta pada layar ponsel (390 × 844 px).",
    "Halaman provinsi Bali dengan enam kategori budaya dan sumbernya.",
    "Halaman penjelasan sebelum kuis dimulai.",
    "Soal pilihan ganda dengan progres dan indikator skor.",
    "Umpan balik setelah menjawab, disertai penjelasan singkat.",
    "Menu Tantangan Budaya dengan tiga pilihan permainan.",
    "Permainan Jodohkan Budaya.",
    "Halaman profil dengan level, XP, bintang, dan riwayat kuis.",
    "Halaman pencapaian dengan lencana budaya.",
    "Halaman pengaturan profil, tampilan, data, dan koneksi server.",
    "Beranda saat offline; banner status muncul di bagian atas.",
    "Halaman provinsi saat offline dengan data budaya lokal.",
    "Halaman hasil kuis: 26/26, 100% benar, tiga bintang, dan +260 XP.",
]
for i, text in enumerate(gambar, 1):
    par = doc.add_paragraph()
    par.paragraph_format.space_after = Pt(3)
    par.paragraph_format.left_indent = Cm(0.6)
    par.paragraph_format.first_line_indent = Cm(-0.6)
    run = par.add_run(f"Gambar {i}. ")
    run.bold = True
    run.font.size = Pt(9.5)
    run2 = par.add_run(text)
    run2.font.size = Pt(9.5)

h1("Daftar Tabel")
tabel_list = [
    "Fitur utama aplikasi.",
    "Palet warna “Nusantara Modern” beserta penggunaannya.",
    "Sebaran 38 provinsi pada tujuh kelompok pulau.",
    "Sumber data budaya pada aplikasi.",
    "Komposisi soal kuis untuk setiap provinsi.",
    "Tiga permainan pada Tantangan Budaya.",
    "Teknologi utama pada aplikasi.",
    "Struktur direktori utama.",
    "Strategi cache pada service worker.",
    "Perilaku aplikasi saat online dan offline.",
    "Lingkungan pengujian.",
    "Ringkasan pengujian fungsional.",
    "Rincian hasil pengujian kuis Bali.",
    "Hasil pemeriksaan produksi.",
    "Alamat layanan produksi.",
    "Kendala teknis dan solusinya.",
]
for i, text in enumerate(tabel_list, 1):
    par = doc.add_paragraph()
    par.paragraph_format.space_after = Pt(3)
    par.paragraph_format.left_indent = Cm(0.6)
    par.paragraph_format.first_line_indent = Cm(-0.6)
    run = par.add_run(f"Tabel {i}. ")
    run.bold = True
    run.font.size = Pt(9.5)
    run2 = par.add_run(text)
    run2.font.size = Pt(9.5)

# ---------------------------------------------------------------- lampiran
h1("Lampiran A. Petunjuk Instalasi dan Penggunaan Offline", page_break=True)
h2("A.1 Android (Chrome)")
bullets(
    [
        "Buka https://bhinneka-tunggal-ika.vercel.app dengan internet.",
        "Tunggu 10–20 detik dan jelajahi beberapa halaman agar aset tersimpan.",
        "Ketuk menu ⋮, lalu pilih Install app atau Tambahkan ke layar utama.",
        "Tutup aplikasi, matikan Wi-Fi dan data seluler.",
        "Buka aplikasi dari ikon di layar utama.",
    ],
    numbered=True,
)
h2("A.2 iPhone dan iPad (Safari)")
bullets(
    [
        "Buka alamat aplikasi di Safari.",
        "Ketuk tombol Share, lalu pilih Add to Home Screen.",
        "Tutup Safari, matikan internet, lalu buka dari ikon tersebut.",
    ],
    numbered=True,
)
h2("A.3 Laptop (Chrome atau Edge)")
bullets(
    [
        "Buka alamat aplikasi dan tunggu hingga selesai dimuat.",
        "Klik ikon install di address bar, atau menu ⋮ → Install.",
        "Untuk menguji: buka DevTools → Network → centang Offline, lalu muat ulang.",
    ],
    numbered=True,
)
h2("A.4 Cara Memastikan Mode Offline Aktif")
bullets(
    [
        "DevTools → Application → Service Workers: status activated.",
        "DevTools → Application → Cache Storage: ada cache bti-<versi> dengan 66 entri.",
        "Buka /provinsi/bali saat offline: data budaya tampil dan banner mode offline muncul.",
    ]
)
callout(
    "Penting",
    "Jangan memilih “Clear site data” atau menghapus cache situs. Tindakan tersebut menghapus "
    "mode offline dan progres yang tersimpan di perangkat.",
    fill="FDECEA",
    border="D94A36",
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
