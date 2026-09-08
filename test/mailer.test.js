import assert from 'node:assert/strict';
import test from 'node:test';

delete process.env.RESEND_API_KEY;
delete process.env.RESEND_FROM;
delete process.env.SMTP_HOST;
delete process.env.SMTP_USER;
delete process.env.SMTP_PASS;
delete process.env.SMTP_FROM;

const { sendPasswordResetEmail, sendSignupOtpEmail } = await import('../server/services/mailer.js');

test('mailer falls back to a logged, non-delivered result when no provider is configured', async () => {
  const resetResult = await sendPasswordResetEmail('user@example.com', 'http://localhost/reset?token=abc');
  assert.deepEqual(resetResult, { delivered: false, mode: 'log' });

  const otpResult = await sendSignupOtpEmail('user@example.com', '123456', 'en');
  assert.deepEqual(otpResult, { delivered: false, mode: 'log' });
});
