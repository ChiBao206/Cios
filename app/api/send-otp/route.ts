import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/sendEmail';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ message: 'Thiếu thông tin email hoặc OTP' }, { status: 400 });
    }

    const subject = "Mã xác nhận khôi phục mật khẩu - CIOs Camera";
    
    // Giao diện email cực xịn xò gửi tới khách hàng
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        <div style="text-align: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px;">
          <h2 style="color: #1e293b; margin: 0;">CIOs - Khôi Phục Mật Khẩu</h2>
        </div>
        <p style="color: #475569; font-size: 16px;">Chào bạn,</p>
        <p style="color: #475569; font-size: 16px;">Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản liên kết với email này. Dưới đây là mã xác nhận (OTP) của bạn:</p>
        
        <div style="background: #f1f5f9; padding: 20px; text-align: center; border-radius: 8px; margin: 25px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #e11d48;">${otp}</span>
        </div>
        
        <p style="color: #ef4444; font-size: 14px; text-align: center; font-weight: bold;">⚠️ Mã này có hiệu lực trong vòng 5 phút. Vui lòng KHÔNG CHIA SẺ mã này cho bất kỳ ai.</p>
        <hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 25px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">Nếu bạn không yêu cầu đổi mật khẩu, hãy bỏ qua email này hoặc liên hệ hỗ trợ.</p>
      </div>
    `;

    // Gọi hàm sendEmail từ file của bạn
    const success = await sendEmail(email, subject, html);

    if (success) {
      return NextResponse.json({ message: 'Gửi email thành công' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Lỗi khi gửi email' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ message: 'Lỗi server' }, { status: 500 });
  }
}