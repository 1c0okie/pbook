import { Resend } from 'resend';

export const sendEmail = async ({ to, subject, html }) => {
  // BƯỚC QUAN TRỌNG: Đưa dòng khởi tạo này vào BÊN TRONG hàm
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const data = await resend.emails.send({
      from: 'Cửa hàng Sách <lostfrom@pbook.ink>', 
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