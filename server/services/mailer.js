import nodemailer from 'nodemailer';

function getResendConfig() {
  const { RESEND_API_KEY, RESEND_FROM } = process.env;
  if (!RESEND_API_KEY || !RESEND_FROM) {
    return null;
  }

  return {
    apiKey: RESEND_API_KEY,
    from: RESEND_FROM,
  };
}

function parseSecure(value, port) {
  if (typeof value === 'string') {
    return value === 'true';
  }

  return Number(port) === 465;
}

function getMailerConfig() {
  const {
    SMTP_HOST,
    SMTP_PORT = '587',
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM,
  } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    return null;
  }

  return {
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: parseSecure(SMTP_SECURE, SMTP_PORT),
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    from: SMTP_FROM,
  };
}

async function sendWithResend({ to, subject, text, html }) {
  const config = getResendConfig();
  if (!config) {
    return false;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: config.from,
      to,
      subject,
      text,
      html,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`RESEND_ERROR_${response.status}${body ? `_${body}` : ''}`);
  }

  return true;
}

async function sendPasswordResetEmail(email, resetLink) {
  const subject = 'Reset your Gex Shanghai password';
  const text = [
    'We received a request to reset your password.',
    '',
    `Open this link to choose a new password: ${resetLink}`,
    '',
    'This link expires in 60 minutes.',
    'If you did not request this change, you can ignore this email.',
  ].join('\n');
  const html = `
      <p>We received a request to reset your password.</p>
      <p><a href="${resetLink}">Open this link to choose a new password</a></p>
      <p>This link expires in 60 minutes.</p>
      <p>If you did not request this change, you can ignore this email.</p>
    `;

  try {
    const sentByApi = await sendWithResend({ to: email, subject, text, html });
    if (sentByApi) {
      return { delivered: true, mode: 'resend' };
    }
  } catch (error) {
    console.error('Resend delivery failed, falling back to SMTP/log', error);
  }

  const config = getMailerConfig();

  if (!config) {
    console.log(`Password reset email fallback for ${email}: ${resetLink}`);
    return { delivered: false, mode: 'log' };
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });

  await transporter.sendMail({
    from: config.from,
    to: email,
    subject,
    text,
    html,
  });

  return { delivered: true, mode: 'smtp' };
}

async function sendSignupOtpEmail(email, otpCode, language = 'zh') {
  const subject = language === 'zh' ? '上海相亲角邮箱验证码' : 'Your Gex Shanghai verification code';
  const text = language === 'zh'
    ? [
      '您正在注册上海相亲角账号。',
      '',
      `邮箱验证码：${otpCode}`,
      '',
      '验证码 10 分钟内有效。请勿泄露给他人。',
    ].join('\n')
    : [
      'You are creating a Gex Shanghai account.',
      '',
      `Your verification code is: ${otpCode}`,
      '',
      'This code expires in 10 minutes. Do not share it with anyone.',
    ].join('\n');

  const html = `
      <p>${language === 'zh' ? '您正在注册上海相亲角账号。' : 'You are creating a Gex Shanghai account.'}</p>
      <p><strong>${language === 'zh' ? '邮箱验证码' : 'Verification code'}: ${otpCode}</strong></p>
      <p>${language === 'zh' ? '验证码 10 分钟内有效。请勿泄露给他人。' : 'This code expires in 10 minutes. Do not share it with anyone.'}</p>
    `;

  try {
    const sentByApi = await sendWithResend({ to: email, subject, text, html });
    if (sentByApi) {
      return { delivered: true, mode: 'resend' };
    }
  } catch (error) {
    console.error('Resend delivery failed, falling back to SMTP/log', error);
  }

  const config = getMailerConfig();

  if (!config) {
    console.log(`Signup OTP email fallback for ${email}: ${otpCode}`);
    return { delivered: false, mode: 'log' };
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });

  await transporter.sendMail({
    from: config.from,
    to: email,
    subject,
    text,
    html,
  });

  return { delivered: true, mode: 'smtp' };
}

export { sendPasswordResetEmail, sendSignupOtpEmail };