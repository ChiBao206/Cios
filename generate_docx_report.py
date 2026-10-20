# -*- coding: utf-8 -*-
import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

def create_document():
    doc = Document()

    # 1. Page Margins (0.75 inch)
    for section in doc.sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)

    # Palette
    COLOR_PRIMARY = RGBColor(12, 74, 110)      # Navy Blue #0C4A6E
    COLOR_SECONDARY = RGBColor(2, 132, 199)    # Sky Blue #0284C7
    COLOR_TEXT = RGBColor(30, 41, 59)          # Slate 800 #1E293B
    COLOR_THEORY = RGBColor(3, 105, 161)       # Blue 700 #0369A1
    COLOR_PRACTICE = RGBColor(5, 150, 105)     # Green 600 #059669
    HEX_BG_HEADER = "E0F2FE"                   # Sky 100
    HEX_BORDER = "BAE6FD"                      # Sky 200

    def set_cell_background(cell, fill_hex):
        shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
        cell._tc.get_or_add_tcPr().append(shading_elm)

    def set_cell_margins(cell, top=140, bottom=140, left=180, right=180):
        tcPr = cell._tc.get_or_add_tcPr()
        tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
        tcPr.append(tcMar)

    def set_cell_borders(cell, color="BAE6FD", sz="6", val="single"):
        tcPr = cell._tc.get_or_add_tcPr()
        borders = parse_xml(f'<w:tcBorders {nsdecls("w")}><w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/><w:left w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/><w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/><w:right w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/></w:tcBorders>')
        tcPr.append(borders)

    # ==========================
    # COVER / HEADER BANNER
    # ==========================
    title_p = doc.add_paragraph()
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_run = title_p.add_run("BÁO CÁO TRẢ LỜI CÂU HỎI VẤN ĐÁP")
    title_run.font.name = "Arial"
    title_run.font.size = Pt(22)
    title_run.font.bold = True
    title_run.font.color.rgb = COLOR_PRIMARY

    sub_p = doc.add_paragraph()
    sub_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    sub_run = sub_p.add_run("MÔN: LẬP TRÌNH WEB & FRONTEND FRAMEWORK (NEXT.JS)\nDỰ ÁN: HỆ THỐNG WEBSITE THƯƠNG MẠI ĐIỆN TỬ CAMERA AN NINH CIOS")
    sub_run.font.name = "Arial"
    sub_run.font.size = Pt(13)
    sub_run.font.bold = True
    sub_run.font.color.rgb = COLOR_SECONDARY

    info_p = doc.add_paragraph()
    info_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    info_run = info_p.add_run("• Công nghệ: Next.js 16 (App Router), React 19, TypeScript, MongoDB Atlas Cloud, Tailwind & Custom CSS\n• Nền tảng triển khai: Vercel Cloud (cios-camera.vercel.app) | Dữ liệu: 100% Real Database MongoDB")
    info_run.font.name = "Arial"
    info_run.font.size = Pt(10)
    info_run.font.italic = True
    info_run.font.color.rgb = RGBColor(100, 116, 139)

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # Helper function to add a Q&A Card
    def add_qa_card(section_title, q_num, question, theory_ans, practice_ans):
        table = doc.add_table(rows=2, cols=1)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = False

        # Width
        for row in table.rows:
            row.cells[0].width = Inches(7.0)

        # Row 0: Question Header
        cell_q = table.cell(0, 0)
        set_cell_background(cell_q, HEX_BG_HEADER)
        set_cell_borders(cell_q, color=HEX_BORDER, sz="6")
        set_cell_margins(cell_q, top=120, bottom=120, left=180, right=180)

        pq = cell_q.paragraphs[0]
        pq.paragraph_format.space_after = Pt(0)
        rq_num = pq.add_run(f"Câu {q_num}: ")
        rq_num.font.name = "Arial"
        rq_num.font.bold = True
        rq_num.font.size = Pt(11.5)
        rq_num.font.color.rgb = COLOR_PRIMARY

        rq_text = pq.add_run(question)
        rq_text.font.name = "Arial"
        rq_text.font.bold = True
        rq_text.font.size = Pt(11.5)
        rq_text.font.color.rgb = COLOR_PRIMARY

        # Row 1: Answers (Theory + CiOs Practical Application)
        cell_a = table.cell(1, 0)
        set_cell_background(cell_a, "FFFFFF")
        set_cell_borders(cell_a, color=HEX_BORDER, sz="6")
        set_cell_margins(cell_a, top=140, bottom=140, left=180, right=180)

        # 1. Theory Paragraph
        pa_theory = cell_a.paragraphs[0]
        pa_theory.paragraph_format.space_after = Pt(6)
        rt_lbl = pa_theory.add_run("📚 Lý thuyết trọng tâm: ")
        rt_lbl.font.name = "Arial"
        rt_lbl.font.bold = True
        rt_lbl.font.size = Pt(10.5)
        rt_lbl.font.color.rgb = COLOR_THEORY

        rt_txt = pa_theory.add_run(theory_ans)
        rt_txt.font.name = "Arial"
        rt_txt.font.size = Pt(10.5)
        rt_txt.font.color.rgb = COLOR_TEXT

        # 2. Practice in CiOs Paragraph
        pa_practice = cell_a.add_paragraph()
        pa_practice.paragraph_format.space_after = Pt(2)
        rp_lbl = pa_practice.add_run("💻 Ứng dụng thực tế trong Web CiOs Camera: ")
        rp_lbl.font.name = "Arial"
        rp_lbl.font.bold = True
        rp_lbl.font.size = Pt(10.5)
        rp_lbl.font.color.rgb = COLOR_PRACTICE

        rp_txt = pa_practice.add_run(practice_ans)
        rp_txt.font.name = "Arial"
        rp_txt.font.size = Pt(10.5)
        rp_txt.font.color.rgb = COLOR_TEXT

        # Spacing after each card
        sp_p = doc.add_paragraph()
        sp_p.paragraph_format.space_before = Pt(0)
        sp_p.paragraph_format.space_after = Pt(6)

    def add_section_header(title, desc):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(16)
        p.paragraph_format.space_after = Pt(4)
        run = p.add_run(title)
        run.font.name = "Arial"
        run.font.size = Pt(15)
        run.font.bold = True
        run.font.color.rgb = COLOR_PRIMARY

        p_desc = doc.add_paragraph()
        p_desc.paragraph_format.space_after = Pt(10)
        run_desc = p_desc.add_run(desc)
        run_desc.font.name = "Arial"
        run_desc.font.size = Pt(10)
        run_desc.font.italic = True
        run_desc.font.color.rgb = RGBColor(71, 85, 105)

    print("Structure ready, loading Q&A data...")
    return doc, add_section_header, add_qa_card

print("Builder initialized")

