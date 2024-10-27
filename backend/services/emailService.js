const transporter = require('../config/nodemailer');

exports.sendPasswordResetEmail = async (email, resetToken) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: '비밀번호 재설정',
    html: `
      <p>안녕하세요,</p>
      <p>비밀번호 재설정을 요청하셨습니다. 아래 링크를 클릭하여 비밀번호를 재설정해주세요:</p>
      <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}">비밀번호 재설정</a>
      <p>이 링크는 1시간 동안 유효합니다.</p>
      <p>비밀번호 재설정을 요청하지 않으셨다면 이 이메일을 무시해주세요.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('비밀번호 재설정 이메일이 성공적으로 전송되었습니다.');
  } catch (error) {
    console.error('이메일 전송 중 오류 발생:', error);
    throw new Error('이메일 전송에 실패했습니다.');
  }
};