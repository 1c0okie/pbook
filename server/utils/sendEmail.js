import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    // THAY THẾ dòng service: 'gmail' bằng các dòng dưới đây
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // dùng cổng 465 thì secure là true
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // THÊM thuộc tính này để giải quyết lỗi ENETUNREACH trên Render
    family: 4, 
    tls: {
      rejectUnauthorized: false
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