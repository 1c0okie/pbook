import { Resend } from 'resend';

// Khởi tạo Resend với API Key lấy từ biến môi trường
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const data = await resend.emails.send({
      // BẮT BUỘC ĐỂ NGUYÊN EMAIL NÀY NẾU CHƯA XÁC MINH TÊN MIỀN
      from: 'onboarding@resend.dev', 
      to: to,
      subject: subject,
      html: html,
    });

    console.log("Đã gửi email qua Resend thành công:", data);
    return data;
  } catch (error) {
    console.error("LỖI RESEND:", error);
    throw new Error('Không thể gửi email lúc này');
  }
};