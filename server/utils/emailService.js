const nodemailer = require('nodemailer');
// nodemailer - библиотека для отправки email

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  // host - SMTP сервер Gmail
  port: 587,
  // port - порт для нешифрованного соединения
  secure: false,
  // secure: false - используем STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    // EMAIL_USER - email отправителя
    pass: process.env.EMAIL_PASSWORD
    // EMAIL_PASSWORD - обычный пароль от Gmail
  }
});

const sendVerificationEmail = async (email, token) => {
  // sendVerificationEmail - функция отправки письма подтверждения
  const verificationUrl = `http://localhost:3000/api/auth/verify-email/${token}`;
  // verificationUrl - ссылка для подтверждения email

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Подтверждение email - Tech Service Pro',
    html: `
      <h2>Подтвердите ваш email</h2>
      <p>Для завершения регистрации перейдите по ссылке:</p>
      <a href="${verificationUrl}">Подтвердить email</a>
      <p>Ссылка действительна 24 часа</p>
    `
  };

  await transporter.sendMail(mailOptions);
  // transporter.sendMail - отправка письма
}

module.exports = { sendVerificationEmail };