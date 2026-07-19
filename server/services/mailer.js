import nodemailer from 'nodemailer';

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

async function sendPasswordResetEmail(email, resetLink) {
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
    subject: 'Reset your Gex Shanghai password',
    text: [
      'We received a request to reset your password.',
      '',
      `Open this link to choose a new password: ${resetLink}`,
      '',
      'This link expires in 60 minutes.',
      'If you did not request this change, you can ignore this email.',
    ].join('\n'),
    html: `
      <p>We received a request to reset your password.</p>
      <p><a href="${resetLink}">Open this link to choose a new password</a></p>
      <p>This link expires in 60 minutes.</p>
      <p>If you did not request this change, you can ignore this email.</p>
    `,
  });

  return { delivered: true, mode: 'smtp' };
}

export { sendPasswordResetEmail };