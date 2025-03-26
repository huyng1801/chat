const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Email templates
const emailTemplates = {
  forgotPassword: (user, tempPassword) => ({
    from: process.env.SMTP_FROM || '"Chat System" <noreply@chat.com>',
    to: user.email,
    subject: 'Mật khẩu tạm thời của bạn',
    html: `
      <h2>Xin chào ${user.display_name || user.username}!</h2>
      <p>Mật khẩu tạm thời của bạn là: <strong>${tempPassword}</strong></p>
      <p>Vui lòng đăng nhập và đổi mật khẩu ngay sau khi nhận được email này.</p>
      <p>Trân trọng,<br>Chat System</p>
    `
  })
};

// Send email helper
async function sendEmail(template, data) {
  if (!emailTemplates[template]) {
    throw new Error('Email template not found');
  }

  const emailOptions = emailTemplates[template](...data);
  return transporter.sendMail(emailOptions);
}

module.exports = {
  transporter,
  sendEmail,
  emailTemplates
};