# -*- coding: utf-8 -*-
import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

def build_word_report():
    doc = Document()

    # 1. Page Margins
    for section in doc.sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)

    # Colors
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

    # HEADER BANNER
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
    run_sub.font.size = Pt(12.5)
    run_sub.font.bold = True
    run_sub.font.color.rgb = COLOR_SECONDARY

    meta_p = doc.add_paragraph()
    meta_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    meta_p.paragraph_format.space_after = Pt(14)
    run_meta = meta_p.add_run("Kiến trúc công nghệ: Next.js 16 (App Router), React 19, TypeScript, MongoDB Atlas Cloud, Tailwind CSS, Vercel\nPhạm vi: 80 câu hỏi trọng tâm chia thành 5 nhóm kiến thức nền tảng và nâng cao")
    run_meta.font.name = "Arial"
    run_meta.font.size = Pt(10)
    run_meta.font.italic = True
    run_meta.font.color.rgb = RGBColor(100, 116, 139)

    def add_section_header(title, desc):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(16)
        p.paragraph_format.space_after = Pt(3)
        run = p.add_run(title)
        run.font.name = "Arial"
        run.font.size = Pt(14.5)
        run.font.bold = True
        run.font.color.rgb = COLOR_PRIMARY

        p_desc = doc.add_paragraph()
        p_desc.paragraph_format.space_after = Pt(10)
        run_desc = p_desc.add_run(desc)
        run_desc.font.name = "Arial"
        run_desc.font.size = Pt(10)
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
        set_cell_margins(cell_q, top=110, bottom=110, left=160, right=160)

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
        set_cell_margins(cell_a, top=130, bottom=130, left=160, right=160)

        pa_theory = cell_a.paragraphs[0]
        pa_theory.paragraph_format.space_after = Pt(6)
        rt_lbl = pa_theory.add_run("📚 Trả lời lý thuyết: ")
        rt_lbl.font.name = "Arial"
        rt_lbl.font.bold = True
        rt_lbl.font.size = Pt(10.5)
        rt_lbl.font.color.rgb = COLOR_THEORY

        rt_txt = pa_theory.add_run(theory_ans)
        rt_txt.font.name = "Arial"
        rt_txt.font.size = Pt(10.5)
        rt_txt.font.color.rgb = COLOR_TEXT

        pa_practice = cell_a.add_paragraph()
        pa_practice.paragraph_format.space_after = Pt(2)
        rp_lbl = pa_practice.add_run("💻 Liên hệ thực tế trong Website CiOs Camera: ")
        rp_lbl.font.name = "Arial"
        rp_lbl.font.bold = True
        rp_lbl.font.size = Pt(10.5)
        rp_lbl.font.color.rgb = COLOR_PRACTICE

        rp_txt = pa_practice.add_run(practice_ans)
        rp_txt.font.name = "Arial"
        rp_txt.font.size = Pt(10.5)
        rp_txt.font.color.rgb = COLOR_TEXT

        sp_p = doc.add_paragraph()
        sp_p.paragraph_format.space_before = Pt(0)
        sp_p.paragraph_format.space_after = Pt(6)

    # ==========================================================
    # PHẦN 1: 13 CÂU HỎI VẤN ĐÁP CSS
    # ==========================================================
    add_section_header("PHẦN 1: 13 CÂU HỎI VẤN ĐÁP CSS", "Tập trung vào kiến thức định kiểu giao diện, bố cục Flexbox/Grid, Framework CSS và tối ưu hiển thị.")

    add_qa_card(1, "CSS là gì? CSS có vai trò gì trong một website?",
        "CSS (Cascading Style Sheets) là ngôn ngữ định dạng dùng để kiểm soát cách hiển thị của các phần tử HTML trên trang web: quy định màu sắc, phông chữ, khoảng cách đệm (padding/margin), kích thước và cách sắp xếp bố cục tổng thể.",
        "Trong dự án CiOs Camera, toàn bộ giao diện hiện đại được xây dựng trong file app/globals.css (hơn 3.000 dòng code). CSS giúp định nghĩa bảng màu công nghệ an ninh xanh dương (var(--primary-600): #0284c7), tạo hiệu ứng kính mờ (backdrop-filter: blur(14px)), bo góc thẻ sản phẩm 16px và tạo bóng đổ 3D sinh động khi rê chuột.")

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

    # ==========================================================
    # PHẦN 2: 15 CÂU HỎI VẤN ĐÁP HTML5
    # ==========================================================
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

    print("Sections 1 & 2 done, continuing...")
    return doc, add_section_header, add_qa_card

print("File 1 configured")

