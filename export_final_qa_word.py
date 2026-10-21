# -*- coding: utf-8 -*-
import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

def generate_report():
    doc = Document()

    # 1. Page Margins (0.75 inch)
    for section in doc.sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)

    # Color Palette
    COLOR_PRIMARY = RGBColor(12, 74, 110)      # Navy #0C4A6E
    COLOR_SECONDARY = RGBColor(2, 132, 199)    # Blue #0284C7
    COLOR_TEXT = RGBColor(30, 41, 59)          # Dark Slate #1E293B
    COLOR_THEORY = RGBColor(3, 105, 161)       # Sky Blue #0369A1
    COLOR_PRACTICE = RGBColor(5, 150, 105)     # Emerald Green #059669
    HEX_BG_HEADER = "E0F2FE"                   # Light Sky
    HEX_BORDER = "BAE6FD"                      # Sky Border

    def set_cell_background(cell, fill_hex):
        shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
        cell._tc.get_or_add_tcPr().append(shading_elm)

    def set_cell_margins(cell, top=130, bottom=130, left=170, right=170):
        tcPr = cell._tc.get_or_add_tcPr()
        tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
        tcPr.append(tcMar)

    def set_cell_borders(cell, color="BAE6FD", sz="6", val="single"):
        tcPr = cell._tc.get_or_add_tcPr()
        borders = parse_xml(f'<w:tcBorders {nsdecls("w")}><w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/><w:left w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/><w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/><w:right w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/></w:tcBorders>')
        tcPr.append(borders)

    # Header Title
    title_p = doc.add_paragraph()
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(4)
    run_title = title_p.add_run("BÁO CÁO CÂU HỎI VẤN ĐÁP BẢO VỆ ĐỒ ÁN")
    run_title.font.name = "Arial"
    run_title.font.size = Pt(22)
    run_title.font.bold = True
    run_title.font.color.rgb = COLOR_PRIMARY

    sub_p = doc.add_paragraph()
    sub_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    sub_p.paragraph_format.space_after = Pt(4)
    run_sub = sub_p.add_run("DỰ ÁN: WEBSITE THƯƠNG MẠI ĐIỆN TỬ CAMERA AN NINH CIOS (CIOS SECURITY)\nMÔN: LẬP TRÌNH WEB, FRONTEND FRAMEWORK & NEXT.JS")
    run_sub.font.name = "Arial"
    run_sub.font.size = Pt(12)
    run_sub.font.bold = True
    run_sub.font.color.rgb = COLOR_SECONDARY

    meta_p = doc.add_paragraph()
    meta_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    meta_p.paragraph_format.space_after = Pt(14)
    run_meta = meta_p.add_run("Nền tảng công nghệ: Next.js 16 (App Router), React 19, TypeScript, MongoDB Atlas Cloud, Tailwind CSS, Vercel\nNội dung: Trả lời 80 câu hỏi vấn đáp lý thuyết gắn liền 100% với mã nguồn thực tế của website CiOs Camera")
    run_meta.font.name = "Arial"
    run_meta.font.size = Pt(9.5)
    run_meta.font.italic = True
    run_meta.font.color.rgb = RGBColor(100, 116, 139)

    def add_section_header(title, desc):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(3)
        run = p.add_run(title)
        run.font.name = "Arial"
        run.font.size = Pt(14)
        run.font.bold = True
        run.font.color.rgb = COLOR_PRIMARY

        p_desc = doc.add_paragraph()
        p_desc.paragraph_format.space_after = Pt(10)
        run_desc = p_desc.add_run(desc)
        run_desc.font.name = "Arial"
        run_desc.font.size = Pt(9.5)
        run_desc.font.italic = True
        run_desc.font.color.rgb = RGBColor(71, 85, 105)

    def add_qa_card(q_num, question, theory_ans, practice_ans):
        table = doc.add_table(rows=2, cols=1)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = False

        for row in table.rows:
            row.cells[0].width = Inches(7.0)

        # Row 0: Question Header
        cell_q = table.cell(0, 0)
        set_cell_background(cell_q, HEX_BG_HEADER)
        set_cell_borders(cell_q, color=HEX_BORDER, sz="6")
        set_cell_margins(cell_q, top=100, bottom=100, left=150, right=150)

        pq = cell_q.paragraphs[0]
        pq.paragraph_format.space_after = Pt(0)
        rq_num = pq.add_run(f"Câu {q_num}: ")
        rq_num.font.name = "Arial"
        rq_num.font.bold = True
        rq_num.font.size = Pt(11)
        rq_num.font.color.rgb = COLOR_PRIMARY

        rq_text = pq.add_run(question)
        rq_text.font.name = "Arial"
        rq_text.font.bold = True
        rq_text.font.size = Pt(11)
        rq_text.font.color.rgb = COLOR_PRIMARY

        # Row 1: Answers
        cell_a = table.cell(1, 0)
        set_cell_background(cell_a, "FFFFFF")
        set_cell_borders(cell_a, color=HEX_BORDER, sz="6")
        set_cell_margins(cell_a, top=120, bottom=120, left=150, right=150)

        pa_theory = cell_a.paragraphs[0]
        pa_theory.paragraph_format.space_after = Pt(5)
        rt_lbl = pa_theory.add_run("📚 Trả lời lý thuyết: ")
        rt_lbl.font.name = "Arial"
        rt_lbl.font.bold = True
        rt_lbl.font.size = Pt(10)
        rt_lbl.font.color.rgb = COLOR_THEORY

        rt_txt = pa_theory.add_run(theory_ans)
        rt_txt.font.name = "Arial"
        rt_txt.font.size = Pt(10)
        rt_txt.font.color.rgb = COLOR_TEXT

        pa_practice = cell_a.add_paragraph()
        pa_practice.paragraph_format.space_after = Pt(2)
        rp_lbl = pa_practice.add_run("💻 Liên hệ thực tế trong Website CiOs Camera: ")
        rp_lbl.font.name = "Arial"
        rp_lbl.font.bold = True
        rp_lbl.font.size = Pt(10)
        rp_lbl.font.color.rgb = COLOR_PRACTICE

        rp_txt = pa_practice.add_run(practice_ans)
        rp_txt.font.name = "Arial"
        rp_txt.font.size = Pt(10)
        rp_txt.font.color.rgb = COLOR_TEXT

        sp_p = doc.add_paragraph()
        sp_p.paragraph_format.space_before = Pt(0)
        sp_p.paragraph_format.space_after = Pt(5)

    # ==========================================
    # PHẦN 1: 13 CÂU HỎI VẤN ĐÁP CSS
    # ==========================================
    add_section_header("PHẦN 1: 13 CÂU HỎI VẤN ĐÁP CSS", "Tập trung vào kiến thức định kiểu giao diện, bố cục Flexbox/Grid, Framework CSS và tối ưu hiển thị.")
    
    add_qa_card(1, "CSS là gì? CSS có vai trò gì trong một website?",
        "CSS (Cascading Style Sheets) là ngôn ngữ định dạng dùng để kiểm soát cách hiển thị của các phần tử HTML trên trang web: quy định màu sắc, phông chữ, khoảng cách đệm (padding/margin), kích thước và cách sắp xếp bố cục tổng thể.",
        "Toàn bộ giao diện hiện đại của website CiOs Camera được quản lý tập trung trong file app/globals.css (hơn 3.000 dòng code). CSS giúp định nghĩa bảng màu xanh an ninh công nghệ (var(--primary-600): #0284c7), tạo hiệu ứng kính mờ (backdrop-filter: blur(14px)), bo góc thẻ sản phẩm 16px và tạo hiệu ứng đổ bóng phát sáng 3D khi rê chuột.")

    add_qa_card(2, "HTML và CSS khác nhau về nhiệm vụ như thế nào?",
        "HTML đóng vai trò tạo cấu trúc khung xương và nội dung của website (tiêu đề, đoạn văn, ảnh, form). CSS đóng vai trò làm đẹp diện mạo (màu sắc, kích thước, hiệu ứng, bố cục thẩm mỹ). Không có CSS, trang web chỉ là văn bản thô đen trắng.",
        "Trong trang chủ app/page.tsx, HTML/JSX tạo ra khối chứa thông tin camera <h1>, ảnh <img> và nút bấm <button>. Còn globals.css biến các thẻ thô này thành thẻ Hero Banner công nghệ AI phát sáng gradient xanh biển, nút Mua Ngay nổi bật với icon sấm sét vàng.")

    add_qa_card(3, "Có những cách nào để sử dụng CSS trong trang HTML?",
        "Có 3 cách: 1) Inline CSS (viết trực tiếp trong thuộc tính style của thẻ); 2) Internal CSS (viết trong thẻ <style> ở phần <head>); 3) External CSS (tách thành file .css riêng biệt và nhúng vào trang).",
        "Website CiOs ưu tiên 95% External CSS (app/globals.css) để code sạch, tái sử dụng trên mọi trang và tải nhanh nhờ bộ nhớ đệm (cache). Một số trường hợp giá trị thay đổi linh hoạt theo runtime (như dải màu thanh trượt giá theo % sliderPct) em dùng Inline CSS trực tiếp style={{ background: ... }}.")

    add_qa_card(4, "Flexbox và CSS Grid thường được dùng để làm gì?",
        "Cả hai đều dùng để dàn trang bố cục. Flexbox (1 chiều: hàng hoặc cột) phù hợp căn chỉnh các thành phần con linh hoạt, co giãn theo nội dung. CSS Grid (2 chiều: cả hàng và cột) phù hợp tạo các hệ thống lưới phức tạp.",
        "Trong web CiOs:\n• CSS Grid: Dùng cho lưới hiển thị sản phẩm .products-grid-modern (4 cột trên máy tính, 2 cột trên điện thoại), thanh cam kết .trust-grid (4 cột) và bộ lọc giá 2x2.\n• Flexbox: Dùng cho thanh điều hướng Header (căn đều 2 bên), thanh danh mục vuốt ngang .category-nav-list, và thẻ giỏ hàng.")

    add_qa_card(5, "CSS Framework là gì? Kể tên hai Framework CSS phổ biến.",
        "CSS Framework là bộ thư viện định kiểu dựng sẵn, cung cấp các class tiện ích và component tiêu chuẩn giúp lập trình viên thiết kế giao diện nhanh chóng, đồng bộ và chuẩn responsive. Hai framework phổ biến: Bootstrap và Tailwind CSS.",
        "Dự án CiOs kết hợp Tailwind CSS cấu hình trong tailwind.config.ts cùng Custom CSS chuyên sâu trong globals.css để đạt chuẩn giao diện bán hàng camera an ninh chuyên nghiệp.")

    add_qa_card(6, "Bootstrap giúp ích gì khi thiết kế website?",
        "Bootstrap giúp rút ngắn thời gian dựng giao diện nhờ hệ thống lưới Responsive 12 cột (Grid System), các class căn lề tiện lợi và kho component sẵn có như Navbar, Card, Modal, Carousel, Form.",
        "Tư duy chia cột 12 phần và các component Card sản phẩm, Modal popup thông báo khuyến mại tự động trong trang chủ CiOs đều học tập theo chuẩn mực thiết kế tối ưu của Bootstrap.")

    add_qa_card(7, "Tailwind CSS là gì? Có đặc điểm nổi bật nào?",
        "Tailwind CSS là framework theo hướng Utility-First, cung cấp hàng ngàn class nhỏ độc lập (như flex, p-4, text-center, bg-blue-600) để ghép trực tiếp vào HTML/JSX mà không cần tốn thời gian đặt tên class hay nhảy qua file CSS riêng.",
        "Trong các component như Header.tsx và NotifBadge.tsx, các class Tailwind như relative, inline-flex, rounded-full, transition-all được gán trực tiếp vào JSX giúp code giao diện cực kỳ trực quan và tinh gọn.")

    add_qa_card(8, "Bootstrap và Tailwind CSS khác nhau chủ yếu ở điểm nào?",
        "Bootstrap cung cấp các Component hoàn chỉnh có sẵn mẫu mã (dễ làm nhưng dễ bị trùng lặp giao diện phổ thông). Tailwind CSS cung cấp các class nguyên tử (atomic utilities) giúp tự do sáng tạo thiết kế riêng biệt và tùy biến sâu.",
        "CiOs Camera cần phong cách Cyber Security cao cấp độc quyền (màu xanh thương hiệu, thanh trượt lọc giá capsule, badge đơn hàng MongoDB), do đó phương pháp kết hợp Utility Classes giúp tùy biến từng pixel tốt hơn nhiều so với dùng mẫu Bootstrap có sẵn.")

    add_qa_card(9, "Trong trường hợp nào Tailwind CSS có lợi thế hơn Bootstrap?",
        "Khi dự án cần thiết kế độc bản theo file Figma/Adobe XD, cần tối ưu hóa dung lượng file CSS tải về (Tailwind tự động loại bỏ class thừa qua PurgeCSS khi build), và cần kiểm soát chi tiết từng viền bo cong, bóng mờ.",
        "Website CiOs đòi hỏi giao diện công nghệ bảo mật độc đáo với các hiệu ứng kính mờ (glassmorphism), thanh danh mục vuốt ngang bo tròn capsule. Tailwind và Custom CSS giúp tinh chỉnh nhẹ nhàng mà file build Vercel vẫn siêu nhẹ.")

    add_qa_card(10, "Hãy nêu một vài class Tailwind em thường dùng và tác dụng của chúng.",
        "Ví dụ: flex (bố trí Flexbox), items-center (căn giữa theo trục phụ), justify-between (căn cách đều 2 đầu), grid (tạo lưới), p-4 (padding 16px), text-white (chữ trắng), bg-sky-600 (nền xanh), rounded-xl (bo góc 12px), shadow-lg (đổ bóng nổi).",
        "Trong thẻ sản phẩm CiOs, em dùng: flex justify-between items-center để căn chỉnh giá bán và nút giỏ hàng; rounded-2xl để bo cong thẻ camera; transition-all hover:scale-105 để tạo hiệu ứng phóng to nhẹ khi khách lướt chuột qua.")

    add_qa_card(11, "Nên dùng thư viện CSS qua CDN hay cài trong dự án? Vì sao?",
        "CDN phù hợp khi học tập, thử nghiệm nhanh. Cài trực tiếp trong dự án qua npm giúp chủ động quản lý phiên bản, kiểm soát quy trình biên dịch (build/minify), trang web tải offline được và đảm bảo bảo mật khi deploy sản phẩm thực tế.",
        "Toàn bộ thư viện của CiOs (Tailwind, Font Awesome, Context API) đều được cài qua package.json và quản lý trong node_modules. Khi đẩy code lên Vercel, hệ thống tự động build đóng gói thành các file tĩnh nén nhỏ nhất, tải trang chỉ mất 0.5 giây.")

    add_qa_card(12, "Kỹ thuật giúp website tự thay đổi giao diện theo thiết bị gọi là gì? Có lợi ích gì?",
        "Đó là Responsive Web Design. Lợi ích: Giúp website tương thích hoàn hảo trên điện thoại, máy tính bảng và màn hình máy tính; người dùng đọc chữ rõ ràng, bấm nút dễ dàng, không bị tràn màn hình ngang (vỡ layout) và được Google ưu tiên xếp hạng SEO cao.",
        "Khách hàng vào web CiOs trên điện thoại iPhone hay máy tính bàn đều xem rõ thông số camera, bộ lọc giá hiển thị dạng lưới 2 cột gọn gàng, thanh danh mục vuốt ngón tay mượt mà và nút Mua Ngay luôn nằm gọn trong khung nhìn.")

    add_qa_card(13, "Mobile First là gì? CSS dùng gì để thay đổi bố cục theo kích thước màn hình?",
        "Mobile First là chiến lược thiết kế ưu tiên giao diện cho màn hình di động nhỏ trước, sau đó mới mở rộng cho tablet và máy tính. CSS sử dụng Media Queries (@media) với các điểm ngắt (breakpoints) để áp dụng các bộ luật CSS tương ứng khi chiều rộng màn hình thay đổi.",
        "Trong globals.css, em khai báo các breakpoint chuẩn: @media (max-width: 1100px) cho máy tính bảng, @media (max-width: 768px) cho điện thoại, và @media (max-width: 480px) cho điện thoại nhỏ. Trên mobile, sidebar được chuyển thành thanh danh mục vuốt ngang và bộ lọc giá 2 cột cực kỳ gọn đẹp.")

    # ==========================================
    # PHẦN 2: 15 CÂU HỎI VẤN ĐÁP HTML5
    # ==========================================
    add_section_header("PHẦN 2: 15 CÂU HỎI VẤN ĐÁP HTML5", "Kiến thức về ngôn ngữ đánh dấu, thẻ Semantic, cấu trúc tài liệu, Form nhập liệu và tối ưu hóa SEO.")

    add_qa_card(1, "HTML là gì? HTML, CSS và JavaScript có vai trò khác nhau như thế nào?",
        "HTML (HyperText Markup Language) là ngôn ngữ đánh dấu siêu văn bản định hình cấu trúc và nội dung trang web. Vai trò: HTML tạo khung xương, CSS trang điểm làm đẹp diện mạo, JavaScript cung cấp hành vi tương tác và xử lý nghiệp vụ.",
        "Trong thẻ sản phẩm CiOs: HTML/JSX tạo thẻ tiêu đề camera, ảnh và nút bấm; CSS tô màu xanh gradient và bóng đổ 3D; JavaScript xử lý sự kiện onClick={() => addToCart(product)} để tính tiền và cập nhật số lượng giỏ hàng.")

    add_qa_card(2, "HTML5 có những điểm mới nổi bật nào so với các phiên bản HTML trước?",
        "HTML5 bổ sung các thẻ ngữ nghĩa Semantic (header, nav, main, section, footer), thẻ đa phương tiện audio/video trực tiếp không cần plugin Flash, các kiểu input form mới (email, number, range, date), và cơ chế lưu trữ cục bộ (localStorage, sessionStorage).",
        "Dự án CiOs dùng input type=\"range\" cho thanh kéo lọc khoảng giá từ 0 đến 5 triệu đồng, dùng sessionStorage nhớ trang hiện tại home_current_page khi bấm quay lại, và dùng localStorage lưu trữ giỏ hàng.")

    add_qa_card(3, "Trong cấu trúc một trang HTML5, <!DOCTYPE html>, <head> và <body> có nhiệm vụ gì?",
        "<!DOCTYPE html> khai báo chuẩn HTML5 giúp trình duyệt render đúng chuẩn W3C. <head> chứa siêu dữ liệu không hiển thị (meta, title, link css, script). <body> chứa toàn bộ giao diện và nội dung hiển thị cho người dùng nhìn thấy.",
        "Trong file app/layout.tsx: Khai báo <!DOCTYPE html>, phần <head> nhúng favicon camera, cấu hình viewport và font chữ Inter; phần <body> chứa Header, giỏ hàng, nội dung các trang con qua {children} và Footer.")

    add_qa_card(4, "Thẻ <meta charset=\"UTF-8\"> và thẻ <title> có tác dụng gì?",
        "Thẻ <meta charset=\"UTF-8\"> chỉ định bảng mã ký tự chuẩn quốc tế, giúp hiển thị tiếng Việt có dấu chính xác không bị lỗi font hình thoi (?). Thẻ <title> hiển thị tiêu đề trên tab trình duyệt và tiêu đề liên kết khi xuất hiện trên kết quả tìm kiếm Google.",
        "Trong layout.tsx, em cấu hình UTF-8 giúp toàn bộ 40 tên camera an ninh tiếng Việt (ví dụ: 'Đầu ghi hình Hikvision', 'Camera ngoài trời xoay 360 độ') hiển thị sắc nét; thẻ <title> đặt là 'CiOs Security - Giải Pháp Camera AI 4.0'.")

    add_qa_card(5, "Các thẻ <h1> đến <h6> dùng để làm gì? Chúng có vai trò gì đối với SEO?",
        "Là các thẻ phân cấp tiêu đề nội dung (Heading hierarchy) từ quan trọng nhất <h1> đến nhỏ nhất <h6>. Vai trò SEO: Giúp bọ tìm kiếm của Google quét và hiểu rõ cấu trúc bài viết, chủ đề chính của website. Mỗi trang nên có duy nhất 1 thẻ <h1>.",
        "Trang chủ CiOs dùng đúng 1 thẻ <h1> cho biểu ngữ chính: 'Giải Pháp An Ninh & Giám Sát Toàn Diện Cho Ngôi Nhà'. Các tiêu đề phân mục lớn dùng <h2>, và tên của từng mẫu camera dùng <h3> bên trong card sản phẩm.")

    add_qa_card(6, "Các thẻ <p>, <strong> và <em> được sử dụng trong trường hợp nào?",
        "<p> tạo đoạn văn bản thông thường. <strong> dùng để nhấn mạnh nội dung quan trọng (trình duyệt in đậm). <em> dùng để nhấn mạnh mang sắc thái ngữ điệu (trình duyệt in nghiêng).",
        "Trong khối cam kết an ninh, em dùng <p> cho đoạn mô tả giải pháp camera AI, dùng <strong> để làm nổi bật mức giá khuyến mãi và thời hạn 'Bảo hành 24 tháng 1 đổi 1'.")

    add_qa_card(7, "Thẻ <a> và thuộc tính href có tác dụng gì? target=\"_blank\" để làm gì?",
        "Thẻ <a> tạo liên kết chuyển hướng. Thuộc tính href chứa URL đích đến. Thuộc tính target=\"_blank\" ra lệnh cho trình duyệt mở trang đích trong một tab hoặc cửa sổ mới mà không đóng trang hiện tại.",
        "Trong website CiOs, em dùng Next.js <Link href=\"/cart\"> để chuyển trang nội bộ không bị tải lại; đồng thời dùng <a href=\"https://zalo.me/0971024173\" target=\"_blank\" rel=\"noopener noreferrer\"> để mở cửa sổ chat Zalo hỗ trợ kỹ thuật trên tab mới.")

    add_qa_card(8, "Thẻ <div> dùng để làm gì trong bố cục website? Thuộc tính id có ý nghĩa gì?",
        "<div> (Division) là thẻ khối dùng làm container nhóm các phần tử để định dạng CSS hoặc xử lý JavaScript. Thuộc tính id đặt định danh duy nhất cho một phần tử trên trang để tham chiếu CSS hoặc tạo liên kết nhảy trang (anchor).",
        "Khối sản phẩm có định danh <div className=\"main-wrapper\" id=\"products-section\">. Khi người dùng bấm nút 'Khám Phá Sản Phẩm' ở banner trên cùng, trang web sẽ kích hoạt lệnh scrollIntoView({ behavior: 'smooth' }) nhảy mượt xuống đúng vị trí thẻ div này.")

    add_qa_card(9, "Semantic HTML là gì? Hãy nêu một số thẻ Semantic HTML thông dụng.",
        "Semantic HTML là phương pháp dùng các thẻ HTML mang ý nghĩa ngữ nghĩa rõ ràng phản ánh đúng chức năng của nội dung, thay vì lạm dụng thẻ div vô nghĩa. Thẻ thông dụng: <header>, <nav>, <main>, <section>, <article>, <aside>, <footer>.",
        "Trang chủ CiOs có cấu trúc ngữ nghĩa chuẩn SEO: <header> chứa logo và tìm kiếm, <nav> chứa menu điều hướng, <aside className=\"sidebar-col\"> chứa bộ lọc danh mục và khoảng giá, <main className=\"content-col\"> chứa danh sách camera và <footer> chứa thông tin liên hệ bảo hành.")

    add_qa_card(10, "Thẻ <img> và hai thuộc tính src, alt có tác dụng gì? alt hỗ trợ SEO ra sao?",
        "Thẻ <img> dùng để hiển thị hình ảnh. Thuộc tính src chỉ định đường dẫn file ảnh. Thuộc tính alt mô tả nội dung ảnh thay thế khi ảnh bị lỗi mạng, hỗ trợ máy đọc cho người khiếm thị và giúp Google Image nhận diện nội dung bức ảnh.",
        "Mỗi thẻ ảnh camera trong CiOs được viết: <img src={product.image} alt={product.name} />. Nhờ alt chứa tên camera thật (ví dụ 'Camera Wifi Imou Ranger 2'), website đạt điểm SEO kỹ thuật rất cao trên Google Lighthouse.")

    add_qa_card(11, "Thuộc tính width, height trong thẻ <img> có ý nghĩa gì? Vì sao ảnh có thể không hiển thị?",
        "width và height xác định kích thước ảnh hiển thị hoặc giữ chỗ trước (layout reservation) để tránh giật trang (Cumulative Layout Shift - CLS). Ảnh không hiển thị thường do: sai đường dẫn src, file ảnh bị xóa, sai đuôi mở rộng (.jpg/.png) hoặc lỗi phân quyền máy chủ.",
        "Trong CiOs, ảnh camera được đặt trong thư mục public/uploads/ (ví dụ /uploads/92.jpg). Em luôn thiết lập fallback tự động: const displayImg = item.image || '/uploads/32.jpg' để phòng trường hợp sản phẩm chưa kịp tải ảnh.")

    add_qa_card(12, "Trong bảng HTML, các thẻ <table>, <tr>, <th> và <td> dùng để làm gì?",
        "<table> tạo khung bảng; <tr> (table row) tạo hàng; <th> (table header) tạo ô tiêu đề cột (in đậm và căn giữa); <td> (table data) tạo ô chứa dữ liệu thông thường.",
        "Trong trang quản trị app/admin/page.tsx, bảng quản lý 16 đơn hàng thật từ MongoDB được dựng bằng <table>: <th> hiển thị các cột (Mã đơn, Tên khách hàng, Số điện thoại, Tổng tiền, Trạng thái, Thao tác), các thẻ <td> hiển thị thông tin từng đơn hàng.")

    add_qa_card(13, "Thuộc tính colspan trong bảng HTML có tác dụng gì?",
        "Thuộc tính colspan (Column Span) cho phép một ô dữ liệu trải dài (gộp) qua nhiều cột kề nhau trên cùng một hàng.",
        "Khi danh sách đơn hàng trống hoặc đang tải dữ liệu trong trang Admin CiOs, em dùng: <td colSpan={7} className=\"text-center\">Đang tải dữ liệu đơn hàng từ MongoDB...</td> để thông báo chiếm trọn bề ngang bảng.")

    add_qa_card(14, "Form trong HTML là gì? Form thường được sử dụng cho những chức năng nào?",
        "Form (<form>) là biểu mẫu thu thập dữ liệu do người dùng nhập vào để gửi lên máy chủ xử lý. Chức năng thường dùng: Đăng nhập, đăng ký tài khoản, gửi phản hồi liên hệ, thanh toán và đặt hàng trực tuyến.",
        "Website CiOs sử dụng Form tại: 1) Trang checkout giỏ hàng app/cart/page.tsx để thu thập địa chỉ nhận hàng, số điện thoại, ghi chú giao hàng; 2) Trang đăng nhập app/login/page.tsx; 3) Form gửi yêu cầu tư vấn tại /contact.")

    add_qa_card(15, "Phân biệt công dụng của <input>, <textarea>, <select> và <button> trong Form.",
        "• <input>: Ô nhập liệu 1 dòng (text, password, email, number, range).\n• <textarea>: Khung nhập văn bản nhiều dòng (đoạn văn, ghi chú).\n• <select>: Hộp danh sách thả xuống chọn mục (dropdown).\n• <button>: Nút kích hoạt hành động (gửi form, đặt lại).\n• placeholder: Dòng chữ gợi ý mờ hiển thị trước khi người dùng gõ phím.",
        "Trong form đặt hàng CiOs: Em dùng <input type=\"text\" placeholder=\"Họ và tên của bạn\" /> để nhập tên; dùng <textarea placeholder=\"Ghi chú giao hàng (gọi trước khi giao)\" /> để nhập ghi chú; dùng <select> chọn hình thức quét mã VietQR hoặc COD; dùng <button type=\"submit\"> để kích hoạt thanh toán.")

    # ==========================================
    # PHẦN 3: 20 CÂU HỎI VẤN ĐÁP JAVASCRIPT & FRAMEWORK
    # ==========================================
    add_section_header("PHẦN 3: 20 CÂU HỎI VẤN ĐÁP JAVASCRIPT VÀ FRAMEWORK", "Kiến thức về ngôn ngữ JavaScript, mô hình Client-Server, REST API, JSON, Component, Props, Routing.")

    add_qa_card(1, "JavaScript là gì? JavaScript khác HTML và CSS về vai trò như thế nào?",
        "JavaScript là ngôn ngữ lập trình kịch bản xử lý logic và tương tác người dùng. HTML tạo khung cấu trúc, CSS làm đẹp diện mạo, còn JavaScript tạo chức năng sống động (tính toán, tương tác, gọi API, cập nhật dữ liệu).",
        "Trong web CiOs: JS xử lý thêm giỏ hàng, áp mã giảm giá voucher trừ tiền tự động, lọc camera theo mức giá tức thì không cần tải lại trang.")

    add_qa_card(2, "JavaScript có thể thực hiện những công việc gì trên website?",
        "Ví dụ: Lắng nghe sự kiện click/phím, kiểm tra dữ liệu biểu mẫu (validation), gửi nhận dữ liệu qua API, cập nhật DOM động, lưu trữ dữ liệu vào localStorage/sessionStorage, xử lý hiệu ứng hoạt họa animation.",
        "Kiểm tra số điện thoại khi đặt hàng camera, gọi API lưu đơn hàng vào MongoDB, tạo mã thanh toán VietQR động theo số tiền, xử lý vuốt ngang danh mục và phân trang.")

    add_qa_card(3, "JavaScript chỉ chạy trên trình duyệt hay còn chạy ở nơi khác?",
        "Ban đầu JS chỉ chạy trên trình duyệt. Hiện nay nhờ môi trường Node.js (V8 engine), JavaScript chạy mạnh mẽ trên máy chủ (Backend), xử lý cơ sở dữ liệu, file hệ thống và xây dựng API.",
        "Next.js trong dự án CiOs dùng JavaScript chạy cả ở Server (Node.js Route Handlers kết nối MongoDB Atlas) lẫn Client (React trên trình duyệt người dùng).")

    add_qa_card(4, "Mảng (Array) và đối tượng (Object) thường dùng để lưu dữ liệu gì?",
        "Mảng lưu danh sách tuần tự nhiều phần tử có cùng tính chất. Đối tượng (Object) lưu tập hợp các cặp key-value mô tả các thuộc tính chi tiết của một thực thể cụ thể.",
        "• Mảng products chứa danh sách 40 sản phẩm, mảng categories chứa 7 danh mục.\n• Object mô tả 1 camera: { id, name, price, image, description, quantity, sold }.")

    add_qa_card(5, "Frontend là gì? Frontend đảm nhiệm phần nào của website?",
        "Frontend là phần giao diện người dùng nhìn thấy và tương tác trực tiếp (Client-side), thường được xây dựng bằng HTML, CSS và JavaScript/React.",
        "Toàn bộ giao diện hiển thị danh mục, banner camera 4K AI, giỏ hàng, nút mua ngay, hiệu ứng responsive mà khách hàng thao tác trên Vercel.")

    add_qa_card(6, "Backend là gì? Backend thường thực hiện những công việc gì?",
        "Backend là phần xử lý nghiệp vụ máy chủ (Server-side): quản lý cơ sở dữ liệu, xác thực tài khoản, kiểm tra bảo mật, xử lý giao dịch thanh toán và cung cấp API cho Frontend.",
        "Các API Route trong app/api/ kết nối MongoDB Cloud qua Mongoose, kiểm tra tồn kho camera, mã hóa mật khẩu, lưu lịch sử đơn hàng và cập nhật số lượng đã bán.")

    add_qa_card(7, "Tại sao các ứng dụng web thường tách Frontend và Backend?",
        "Để phân chia trách nhiệm (Separation of Concerns), giúp code độc lập, dễ bảo trì, dễ nâng cấp công nghệ và một Backend API có thể phục vụ cùng lúc nhiều Frontend (Web, Mobile App iOS/Android).",
        "Frontend Next.js giao tiếp với Backend MongoDB hoàn toàn qua REST API chuẩn JSON. Sau này có thể viết thêm app di động Flutter/React Native mà không cần sửa Backend.")

    add_qa_card(8, "Hãy kể tên một số công nghệ dùng để xây dựng Backend.",
        "Ví dụ: Node.js (Express, NestJS, Next.js API Routes), PHP (Laravel), C# (.NET Core), Python (Django, FastAPI), Java (Spring Boot).",
        "Dự án sử dụng Node.js thông qua Next.js Server Route Handlers kết hợp Mongoose ORM và cơ sở dữ liệu đám mây MongoDB Atlas.")

    add_qa_card(9, "API là gì? API có vai trò gì giữa Frontend và Backend?",
        "API (Application Programming Interface) là giao diện cho phép các phần mềm trao đổi dữ liệu. Frontend gọi API để lấy hoặc gửi dữ liệu tới Backend.",
        "Khi người dùng bấm 'Đặt hàng', Frontend gửi HTTP POST tới /api/orders kèm giỏ hàng, Backend nhận dữ liệu, ghi vào MongoDB và trả về { success: true, orderId: '...' }.")

    add_qa_card(10, "Khi cần lấy danh sách sản phẩm từ Backend, JavaScript thường dùng gì?",
        "JavaScript thường dùng hàm fetch() có sẵn hoặc thư viện axios để thực hiện HTTP GET request, nhận phản hồi Promise và parse JSON thành dữ liệu có thể sử dụng.",
        "Trong app/page.tsx, hàm fetch('/api/products') được gọi trong useEffect để lấy danh sách 40 sản phẩm thật từ MongoDB Cloud.")

    add_qa_card(11, "JSON là gì? Vì sao JSON thường được dùng trong API?",
        "JSON (JavaScript Object Notation) là định dạng dữ liệu dạng văn bản nhẹ, dễ đọc cho con người và dễ phân tích cho máy tính; tương thích với mọi ngôn ngữ lập trình.",
        "Dữ liệu đơn hàng, voucher, danh mục và cấu hình website đều được serialize thành chuỗi JSON khi truyền giữa client và server (vd: { 'id': 15, 'name': 'Camera IP thân' }).")

    add_qa_card(12, "json-server là gì?",
        "json-server là công cụ tạo REST API giả lập (Mock API) đầy đủ (GET, POST, PUT, DELETE) từ một tệp JSON, không cần tự viết ứng dụng Backend.",
        "Ban đầu dự án dùng db.json với json-server để dựng prototype nhanh giao diện; sau đó đã được nâng cấp lên Backend thật MongoDB Atlas Cloud để lưu trữ vĩnh viễn an toàn.")

    add_qa_card(13, "Vì sao trong lớp học Frontend chúng ta sử dụng json-server?",
        "Để có API và dữ liệu thử nhanh chóng, giúp sinh viên tập trung học gọi API bằng fetch và hiển thị dữ liệu thay vì phải mất thời gian lập trình Backend phức tạp.",
        "Cho phép phát triển giao diện bán camera nhanh chóng ngay từ giai đoạn đầu, sau đó nâng cấp mượt mà sang Next.js Route Handlers.")

    add_qa_card(14, "Muốn chạy json-server cần tệp dữ liệu gì và sử dụng lệnh nào?",
        "Chuẩn bị tệp db.json; cài đặt: npm install -g json-server; chạy: npx json-server db.json --port 3001. Ví dụ API: http://localhost:3001/products.",
        "Tệp db.json trong thư mục gốc dự án chứa sẵn dữ liệu mẫu các sản phẩm camera Hikvision, Imou, Ezviz và danh mục thiết bị mạng.")

    add_qa_card(15, "json-server khác Backend được lập trình thật ở điểm nào?",
        "json-server chỉ đọc/ghi file text JSON đơn giản, không có bảo mật, không có xác thực tài khoản và dễ xung đột khi nhiều người truy cập. Backend thật có CSDL chuyên dụng (MongoDB/SQL), logic bảo mật, mã hóa mật khẩu, phân quyền Admin.",
        "Dự án CiOs hiện chạy trên Backend thật kết nối MongoDB Atlas Cloud, lưu trữ bảo mật mật khẩu tài khoản, kiểm tra mã giảm giá hợp lệ và quản lý trạng thái thanh toán VietQR.")

    add_qa_card(16, "JavaScript Framework là gì? Kể tên vài công nghệ Frontend phổ biến.",
        "Là bộ khung kiến trúc hỗ trợ tổ chức và xây dựng ứng dụng giao diện web quy mô lớn. Ví dụ: React (thư viện UI), Next.js, Vue.js, Angular, Svelte.",
        "Dự án sử dụng Next.js phiên bản mới nhất (Next.js 16) kết hợp thư viện giao diện React 19.")

    add_qa_card(17, "Vì sao website lớn thường sử dụng JavaScript Framework?",
        "Giúp chia nhỏ chức năng thành các component, tái sử dụng giao diện, tổ chức mã nguồn, quản lý state tập trung, tối ưu render qua Virtual DOM và hỗ trợ SEO tốt.",
        "Hệ thống camera CiOs có hàng chục chức năng (bộ lọc giá, giỏ hàng, thông báo, admin, thanh toán), dùng Next.js giúp code gọn gàng, chia nhỏ file, dễ bảo trì và mở rộng.")

    add_qa_card(18, "Component là gì? Vì sao nên chia giao diện thành các Component?",
        "Component là khối giao diện độc lập, có thể tái sử dụng nhiều lần (chứa HTML, CSS và logic riêng). Giúp giảm lặp code (DRY), dễ quản lý và dễ sửa lỗi.",
        "Tách thành các component dùng chung trong thư mục app/components/: Header.tsx (thanh menu), Footer.tsx (chân trang), NotifBadge.tsx (chuông thông báo), FloatingActions.tsx (nút gọi & zalo nổi).")

    add_qa_card(19, "Props có vai trò gì trong các Component?",
        "Props (Properties) dùng để truyền dữ liệu từ Component cha xuống Component con, giúp cùng một Component hiển thị các nội dung khác nhau linh hoạt.",
        "Component thẻ sản phẩm nhận props { product } để render tên camera, ảnh, giá bán và số lượng tồn kho tương ứng.")

    add_qa_card(20, "Routing và Layout trong JavaScript Framework dùng để làm gì?",
        "Routing điều hướng đến trang theo URL; Layout tổ chức các phần dùng chung như Header, Menu, Footer xuyên suốt các trang mà không bị load lại.",
        "app/layout.tsx giữ cố định Header và Footer; khi người dùng bấm xem giỏ hàng (/cart) hay chi tiết camera (/product/[id]), chỉ phần nội dung giữa {children} thay đổi mượt mà.")

    # ==========================================
    # PHẦN 4: 18 CÂU HỎI VẤN ĐÁP NEXT.JS
    # ==========================================
    add_section_header("PHẦN 4: 18 CÂU HỎI VẤN ĐÁP NEXT.JS (APP ROUTER)", "Kiến thức chuyên sâu về Next.js 16, App Router, SSR/CSR, Server Components, Route Handlers và SEO.")

    add_qa_card(1, "Next.js là gì? Next.js được xây dựng dựa trên công nghệ nào?",
        "Next.js là React Framework hàng đầu của Vercel, hỗ trợ Server-Side Rendering (SSR), Static Site Generation (SSG), App Router, API Routes, tối ưu hóa hình ảnh và SEO tự động.",
        "Toàn bộ website CiOs Camera được phát triển trên Next.js 16 (Turbopack engine), chạy trên môi trường Node.js.")

    add_qa_card(2, "Next.js khác ReactJS ở điểm nào?",
        "React chủ yếu xây dựng giao diện phía Client (SPA); Next.js bổ sung hệ thống Routing dựa trên thư mục, Layout lồng nhau, Server Components, Server-Side Rendering và hỗ trợ viết API Backend hoàn chỉnh.",
        "CiOs không cần cài thêm Express backend riêng mà viết luôn API trực tiếp trong thư mục app/api/ của Next.js, deploy 1 cú click lên Vercel là chạy cả Frontend lẫn Backend.")

    add_qa_card(3, "Vì sao nên dùng Next.js để xây dựng website có nhiều trang?",
        "Dễ chia Component, dùng chung Layout, tự động chia nhỏ code (Code Splitting - chỉ tải trang đang xem), quản lý URL và dữ liệu khoa học, tối ưu SEO vượt trội.",
        "Khách hàng chuyển qua lại giữa Trang chủ, Giỏ hàng, Đăng nhập, Chi tiết sản phẩm, Quản trị Admin mà không hề bị reload trắng màn hình.")

    add_qa_card(4, "Muốn tạo và chạy một project Next.js, cần chuẩn bị và sử dụng những lệnh nào?",
        "Cài đặt Node.js và npm; tạo dự án: npx create-next-app@latest my-app; chạy môi trường dev: npm run dev; biên dịch tối ưu: npm run build.",
        "Dự án được khởi tạo với TypeScript, Tailwind, App Router; chạy dev ở cổng http://localhost:3000 và build tối ưu hóa bằng Turbopack.")

    add_qa_card(5, "Thư mục app và public trong Next.js dùng để làm gì?",
        "Thư mục app chứa các trang, Route, Layout và API; thư mục public chứa tài nguyên tĩnh không qua biên dịch (hình ảnh, logo, favicon, video).",
        "public/uploads/ chứa hình ảnh thực tế của 40 mẫu camera Hikvision, Imou; app/ chứa các trang giao diện và API.")

    add_qa_card(6, "App Router của Next.js tạo đường dẫn trang web theo nguyên tắc nào?",
        "Dựa trên cấu trúc thư mục trong app; mỗi thư mục đại diện cho một phân đoạn URL. Thư mục chứa file page.tsx sẽ trở thành một trang công khai.",
        "app/cart/page.tsx tương ứng URL /cart; app/contact/page.tsx tương ứng URL /contact; app/product/[id]/page.tsx tương ứng URL /product/:id.")

    add_qa_card(7, "File page.js (page.tsx) trong Next.js có chức năng gì?",
        "Chứa Component hiển thị nội dung chính của một trang ứng với Route (URL) đó khi người dùng truy cập.",
        "app/page.tsx là giao diện trang chủ giới thiệu camera, danh mục thiết bị, top bán chạy và voucher.")

    add_qa_card(8, "File layout.js (layout.tsx) có vai trò gì trong một website Next.js?",
        "Khai báo bố cục dùng chung (Header, Menu, Footer) bao bọc bên ngoài các trang; nội dung từng trang hiển thị tại vị trí {children}.",
        "app/layout.tsx chứa Header, Footer, NotifBadge, giỏ hàng CartProvider và font chữ Inter áp dụng cho toàn bộ các trang con.")

    add_qa_card(9, "JSX là gì? Khi chuyển HTML sang JSX, cần lưu ý điều gì?",
        "JSX là cú pháp mở rộng cho phép viết HTML trong JavaScript. Lưu ý: class đổi thành className, for đổi thành htmlFor, mọi thẻ phải đóng kín (vd: <img />, <input />), style viết dưới dạng object camelCase style={{ color: 'red' }}.",
        "Toàn bộ các class Font Awesome đổi thành <i className=\"fas fa-camera\"></i>, các thẻ ảnh đóng <img src=\"...\" alt=\"...\" />.")

    add_qa_card(10, "Khi chuyển website HTML thuần sang Next.js, nên tổ chức giao diện như thế nào?",
        "Tách Header, Menu, Footer thành Component dùng chung trong thư mục components/; đưa nội dung riêng vào page.tsx trong app/; đưa hình ảnh vào public/.",
        "Tách Header, Footer, FloatingActions, đưa giỏ hàng vào CartContext.tsx để mọi trang đều xem và thêm sản phẩm vào giỏ hàng được.")

    add_qa_card(11, "Props giúp ích gì khi tạo ProductCard hoặc CategoryCard trong Next.js?",
        "Truyền tên, giá, hình ảnh, đường dẫn… vào cùng một Component để hiển thị nhiều sản phẩm hoặc danh mục khác nhau mà không cần viết lại HTML lặp lại.",
        "Vòng lặp hotProducts.map(product => <div key={product.id}>...</div>) render 40 sản phẩm chỉ bằng một đoạn template ngắn gọn.")

    add_qa_card(12, "Để hiển thị hàng chục sản phẩm từ một mảng, Next.js thường sử dụng cách nào?",
        "Dùng phương thức map() lặp qua mảng sản phẩm, trả về JSX tương ứng; gán thuộc tính key duy nhất cho mỗi phần tử để React tối ưu render.",
        "products.map(p => <div key={p.id || p._id} className=\"product-card-modern\">...</div>) hiển thị toàn bộ 40 camera một cách mượt mà.")

    add_qa_card(13, "Muốn lấy danh sách sản phẩm từ backend trong Next.js thì làm thế nào?",
        "Gọi API bằng fetch() trong useEffect (ở Client Component) hoặc fetch trực tiếp trong Server Component, nhận dữ liệu JSON và gán vào state.",
        "Dùng useEffect gọi song song Promise.all tới các API /api/products, /api/categories, /api/vouchers, /api/orders để lấy dữ liệu thực tế từ MongoDB Atlas.")

    add_qa_card(14, "Dynamic Route trong Next.js là gì? [id] và [slug] dùng để làm gì?",
        "Là Route có tham số thay đổi theo URL; tên thư mục đặt trong ngoặc vuông [id] hoặc [slug] để hứng tham số động.",
        "app/product/[id]/page.tsx nhận ID camera từ URL (vd: /product/15) để truy vấn đúng thông tin camera từ MongoDB.")

    add_qa_card(15, "Trang sản phẩm trong loại cần xử lý những việc chính nào?",
        "Lấy mã hoặc slug của danh mục, gọi API lọc sản phẩm thuộc loại, hiển thị danh sách sản phẩm tương ứng và thông báo nếu danh mục trống.",
        "Khi người dùng bấm chọn pill danh mục (vd: 'Camera ip (thân)'), hàm setSelectedCategory(id) kích hoạt mảng filteredProducts tự động lọc theo categoryId tức thì.")

    add_qa_card(16, "Server Component và Client Component khác nhau thế nào trong Next.js?",
        "Server Component (mặc định) render trên server, nhẹ, tốt cho SEO, không dùng được useState/useEffect; Client Component (khai báo 'use client') chạy trên trình duyệt, hỗ trợ tương tác sự kiện click, form, hook state.",
        "app/page.tsx và app/cart/page.tsx dùng 'use client' để xử lý kéo trượt danh mục, chọn giá, thêm vào giỏ; các API trong app/api/ chạy ở Server để bảo mật MongoDB.")

    add_qa_card(17, "Khi làm Form đăng ký hoặc đăng nhập, vì sao cần Client Component?",
        "Vì cần xử lý sự kiện submit, đọc dữ liệu người dùng gõ vào (state), kiểm tra lỗi form trực tiếp và tương tác với trình duyệt (lưu token/localStorage).",
        "app/login/page.tsx dùng 'use client' để quản lý state { username, password }, gọi API xác thực, lưu thông tin phiên đăng nhập currentUser vào localStorage và điều hướng.")

    add_qa_card(18, "Next.js hỗ trợ thiết lập tiêu đề và mô tả trang phục vụ SEO bằng cách nào?",
        "Khai báo object metadata gồm title, description, keywords trong layout.tsx hoặc page.tsx để Next.js tự sinh các thẻ meta chuẩn SEO trên Server.",
        "Khai báo metadata chuẩn giúp website CiOs Camera hiển thị đầy đủ tiêu đề, mô tả giải pháp camera an ninh 4K AI và hình ảnh xem trước khi chia sẻ link lên Facebook, Zalo.")

    # ==========================================
    # PHẦN 5: 14 CÂU HỎI VẤN ĐÁP RESPONSIVE DESIGN
    # ==========================================
    add_section_header("PHẦN 5: 14 CÂU HỎI VẤN ĐÁP RESPONSIVE DESIGN", "Kiến thức về thiết kế thích ứng đa thiết bị, Grid System, Breakpoints, Media Queries và Utility Responsive.")

    add_qa_card(1, "Responsive Web Design là gì?",
        "Là kỹ thuật thiết kế giúp bố cục, kích thước và cách hiển thị của website tự động điều chỉnh phù hợp với nhiều kích thước màn hình thiết bị khác nhau.",
        "Website CiOs Camera hiển thị hoàn hảo từ màn hình điện thoại iPhone nhỏ gọn (375px) đến màn hình desktop lớn (1920px), không bao giờ bị vỡ giao diện hay tràn viền ngang.")

    add_qa_card(2, "Vì sao website cần thiết kế Responsive?",
        "Để tối ưu trải nghiệm cho hơn 70% người dùng duyệt web bằng điện thoại, giúp dễ đọc chữ, dễ bấm nút, không phải phóng to thu nhỏ, tăng tỷ lệ mua hàng và đạt điểm SEO Google cao.",
        "Khách hàng có thể dễ dàng lướt xem camera, bấm nút 'Chat Zalo', quét mã VietQR và đặt mua camera ngay trên điện thoại khi đang di chuyển ngoài đường.")

    add_qa_card(3, "Một danh sách sản phẩm Responsive thường thay đổi thế nào giữa các thiết bị?",
        "Bố cục lưới sản phẩm tự động co giãn: Desktop rộng hiển thị 4 sản phẩm/hàng, Tablet vừa hiển thị 2-3 sản phẩm/hàng, Mobile nhỏ hiển thị 1-2 sản phẩm/hàng.",
        "Trong globals.css: Desktop hiển thị 4 cột (.products-grid-modern repeat(4, 1fr)), Tablet hiển thị 2 cột (repeat(2, 1fr)), Mobile hiển thị 2 cột vừa vặn với ngón tay.")

    add_qa_card(4, "Thẻ meta viewport có tác dụng gì trong Responsive?",
        "Giúp trình duyệt di động sử dụng chiều rộng viewport theo kích thước thực tế của thiết bị (width=device-width, initial-scale=1.0) thay vì giả lập màn hình máy tính.",
        "Được Next.js tự động nhúng vào <head> của trang, đảm bảo 1px CSS bằng đúng 1px chuẩn trên màn hình Retina của điện thoại.")

    add_qa_card(5, "Breakpoint là gì?",
        "Là ngưỡng chiều rộng màn hình (tính bằng pixel) mà tại đó giao diện sẽ thay đổi cách bố trí hoặc kiểu dáng CSS qua Media Queries.",
        "Dự án CiOs sử dụng các breakpoint: 1100px (Tablet), 768px (Mobile tiêu chuẩn), 480px (Màn hình điện thoại nhỏ).")

    add_qa_card(6, "Mobile First là gì? Có lợi ích gì?",
        "Thiết kế cho màn hình nhỏ (mobile) trước rồi mở rộng dần lên màn hình lớn; giúp ưu tiên trải nghiệm số đông người dùng di động, tải trang nhanh và giao diện gọn gàng.",
        "Thanh danh mục được thiết kế dạng thẻ vuốt ngang siêu nhạy cho ngón tay cái trên điện thoại, sau đó mở rộng thành sidebar dạng cột đầy đủ trên máy tính.")

    add_qa_card(7, "Bootstrap là gì? Hỗ trợ Responsive ra sao?",
        "Bootstrap là CSS Framework phổ biến cung cấp hệ thống lưới Grid System 12 cột, các class tiện ích và component dựng sẵn để thiết kế nhanh và đồng bộ đa thiết bị.",
        "Tư duy phân chia bố cục dạng lưới và logic responsive của Bootstrap là nền tảng để xây dựng lưới sản phẩm trong CiOs.")

    add_qa_card(8, "Hệ thống lưới (Grid System) của Bootstrap chia thành bao nhiêu cột?",
        "Chia cố định thành 12 cột trên mỗi hàng (row); mỗi phần tử có thể chiếm từ 1 đến 12 cột tùy ý, tổng số cột trên 1 hàng bằng 12.",
        "Để hiển thị 4 camera/hàng, mỗi card camera chiếm tỉ lệ tương đương 3 cột (col-3 trong Bootstrap, hoặc grid-cols-4 trong CSS Grid).")

    add_qa_card(9, "Trong Bootstrap, container, row và col có chức năng gì?",
        "container tạo khung nội dung căn giữa trang; row tạo hàng ngang chứa các cột; col tạo cột quy định độ rộng và chứa nội dung thực tế.",
        "Tương đương với .main-wrapper (container) chứa .sidebar-col và .content-col (cột con).")

    add_qa_card(10, "Các class Bootstrap col-12, col-md-6, col-lg-3 thể hiện điều gì?",
        "• col-12: Mặc định trên màn hình nhỏ chiếm trọn vẹn 12 cột (100% bề ngang).\n• col-md-6: Từ màn hình tablet (md >= 768px) chiếm 6 cột (50% bề ngang).\n• col-lg-3: Từ màn hình máy tính (lg >= 992px) chiếm 3 cột (25% bề ngang, 4 phần tử/hàng).",
        "Trong CSS CiOs, quy tắc này được hiện thực hóa: Mobile hiển thị 2 cột, desktop hiển thị 4 cột.")

    add_qa_card(11, "Hãy kể một số thành phần giao diện có sẵn trong Bootstrap.",
        "Ví dụ: Navbar (thanh điều hướng), Card (thẻ hiển thị), Modal (hộp thoại popup), Carousel (thanh trượt ảnh), Button, Form, Alert.",
        "Website CiOs tự xây dựng các component tương ứng với phong cách hiện đại: Card sản phẩm bo tròn 3D, thanh trượt ngang danh mục, badge trạng thái đơn hàng thật từ MongoDB, chuông thông báo NotifBadge.")

    add_qa_card(12, "Tailwind CSS là gì? Utility First nghĩa là gì?",
        "Tailwind CSS là framework dùng nhiều class tiện ích nhỏ để định dạng trực tiếp trên HTML hoặc JSX thay vì viết các file CSS riêng lẻ.",
        "Giúp đội ngũ phát triển nhanh chóng tùy biến giao diện thanh tìm kiếm, màu sắc nút bấm mà không sợ bị xung đột CSS toàn cục.")

    add_qa_card(13, "Trong Tailwind, các tiền tố sm:, md:, lg: có vai trò gì?",
        "Là các tiền tố điều kiện màn hình (Responsive Modifiers). Một class có tiền tố chỉ được kích hoạt khi màn hình đạt từ breakpoint tương ứng trở lên (sm >= 640px, md >= 768px, lg >= 1024px).",
        "Ví dụ hidden md:flex nghĩa là trên điện thoại thì ẩn thanh tìm kiếm to, từ tablet và desktop trở lên (md:) thì mới hiển thị dạng flex.")

    add_qa_card(14, "Trong Tailwind, grid-cols-1, md:grid-cols-2, lg:grid-cols-4 có ý nghĩa gì?",
        "Quy định số cột của lưới: Mặc định trên mobile hiển thị 1 cột; khi màn hình đạt kích thước tablet (md) hiển thị 2 cột; khi đạt màn hình máy tính (lg) hiển thị 4 cột.",
        "Áp dụng trực tiếp cho lưới sản phẩm camera, đảm bảo trên điện thoại thẻ camera đủ to rõ để xem chi tiết thông số, còn trên desktop tận dụng chiều ngang rộng để hiển thị được nhiều sản phẩm cùng lúc.")

    output_path = os.path.abspath("Bao_Cao_Van_Dap_Web_Cios_Camera.docx")
    doc.save(output_path)
    print(f"File Word exported successfully to: {output_path}")
    return output_path

if __name__ == "__main__":
    generate_report()

