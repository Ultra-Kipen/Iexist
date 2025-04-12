// services/emailService.ts
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// 이메일 전송을 위한 설정
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// 이메일 전송 함수
const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
  try {
    if (process.env.NODE_ENV === 'test') {
      console.log('테스트 환경에서 이메일 전송 시뮬레이션:', { to, subject });
      return true;
    }

    const mailOptions = {
      from: `"IExist 서비스" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('이메일 전송 성공:', info.messageId);
    return true;
  } catch (error) {
    console.error('이메일 전송 오류:', error);
    return false;
  }
};

// 비밀번호 재설정 이메일 템플릿
const getPasswordResetTemplate = (resetToken: string, username: string): string => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">비밀번호 재설정</h2>
      <p>안녕하세요, ${username}님!</p>
      <p>비밀번호 재설정을 요청하셨습니다. 아래 링크를 클릭하여 비밀번호를 재설정해 주세요:</p>
      <p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          비밀번호 재설정
        </a>
      </p>
      <p>이 링크는 24시간 동안 유효합니다.</p>
      <p>비밀번호 재설정을 요청하지 않으셨다면, 이 이메일을 무시하셔도 됩니다.</p>
      <p>감사합니다.</p>
      <p>IExist 팀</p>
    </div>
  `;
};

export { sendEmail, getPasswordResetTemplate };