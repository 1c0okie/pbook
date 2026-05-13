import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Sử dụng SSL cho cổng 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // GIẢI PHÁP QUAN TRỌNG: Ép sử dụng IPv4 để tránh lỗi ENETUNREACH trên Render
    family: 4, 
    connectionTimeout: 10000, // Tăng thời gian chờ kết nối lên 10s
  });

  const mailOptions = {
    from: `"Cửa hàng Sách" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};