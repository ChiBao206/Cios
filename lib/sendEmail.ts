import nodemailer from 'nodemailer';

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const emailPass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '');

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: emailPass,
      },
      // Cấu hình đặc biệt cho Vercel Serverless
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: `"CIOs - impossible is nothing" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Đã gửi email thành công tới:", to, "| MessageId:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Lỗi gửi email:", error);
    return false;
  }
};
