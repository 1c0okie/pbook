import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587, // Đã đổi sang cổng 587
    secure: false, // Cổng 587 bắt buộc secure phải là false
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    family: 4, // Vẫn giữ nguyên để chống lỗi ENETUNREACH (IPv6)
    connectionTimeout: 10000, 
    tls: {
      rejectUnauthorized: false // Bỏ qua lỗi xác thực chứng chỉ môi trường cloud
    }
  });

  const mailOptions = {
    from: `"Cửa hàng Sách" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};