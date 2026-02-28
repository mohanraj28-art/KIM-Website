import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
})

const FROM = `"${process.env.EMAIL_FROM_NAME || 'Kaappu Identity'}" <${process.env.EMAIL_FROM}>`

const baseEmailTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kaappu Identity</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0a; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #111; border: 1px solid #222; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px; }
    .body { padding: 40px; color: #e5e7eb; line-height: 1.6; }
    .body h2 { color: #f9fafb; font-size: 22px; margin: 0 0 16px; }
    .body p { color: #9ca3af; margin: 0 0 16px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 16px 0; }
    .code { background: #1a1a2e; border: 1px solid #6366f1; border-radius: 8px; padding: 20px; text-align: center; font-size: 36px; font-weight: 700; color: #6366f1; letter-spacing: 8px; margin: 24px 0; }
    .footer { padding: 24px 40px; background: #0a0a0a; text-align: center; color: #4b5563; font-size: 12px; }
    .footer a { color: #6366f1; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛡️ Kaappu Identity</h1>
      <p>Identity Management & Authentication</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>© 2026 Kaappu Identity. All rights reserved.</p>
      <p>If you didn't request this, please ignore this email or <a href="#">contact support</a>.</p>
    </div>
  </div>
</body>
</html>
`

export async function sendVerificationEmail(email: string, token: string, name?: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'Verify your email address',
    html: baseEmailTemplate(`
      <h2>Verify your email, ${name || 'there'}! 👋</h2>
      <p>Thanks for signing up. Click the button below to verify your email address.</p>
      <a href="${verifyUrl}" class="btn">Verify Email Address</a>
      <p>Or copy and paste this link:</p>
      <p style="word-break:break-all;color:#6366f1;">${verifyUrl}</p>
      <p>This link expires in 24 hours.</p>
    `),
  })
}

export async function sendMagicLinkEmail(email: string, token: string) {
  const magicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/magic?token=${token}`
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'Your magic sign-in link',
    html: baseEmailTemplate(`
      <h2>Your magic sign-in link ✨</h2>
      <p>Click below to sign in instantly — no password needed!</p>
      <a href="${magicUrl}" class="btn">Sign In with Magic Link</a>
      <p>This link expires in 15 minutes and can only be used once.</p>
    `),
  })
}

export async function sendPasswordResetEmail(email: string, token: string, name?: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'Reset your password',
    html: baseEmailTemplate(`
      <h2>Reset your password 🔑</h2>
      <p>Hi ${name || 'there'}, we received a request to reset your password.</p>
      <a href="${resetUrl}" class="btn">Reset Password</a>
      <p>This link expires in 1 hour.</p>
    `),
  })
}

export async function sendOtpEmail(email: string, otp: string, purpose: string = 'verification') {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `Your Kaappu verification code: ${otp}`,
    html: baseEmailTemplate(`
      <h2>Your one-time code 🔐</h2>
      <p>Use the code below for ${purpose}. It expires in 10 minutes.</p>
      <div class="code">${otp}</div>
      <p>Never share this code with anyone.</p>
    `),
  })
}

export async function sendInvitationEmail(email: string, inviterName: string, orgName: string, token: string) {
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation?token=${token}`
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `${inviterName} invited you to join ${orgName}`,
    html: baseEmailTemplate(`
      <h2>You've been invited! 🎉</h2>
      <p><strong>${inviterName}</strong> has invited you to join <strong>${orgName}</strong> on Kaappu Identity.</p>
      <a href="${inviteUrl}" class="btn">Accept Invitation</a>
      <p>This invitation expires in 7 days.</p>
    `),
  })
}

export async function sendNewDeviceEmail(email: string, deviceInfo: string, name?: string) {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'New device sign-in detected',
    html: baseEmailTemplate(`
      <h2>New sign-in detected 🔍</h2>
      <p>Hi ${name || 'there'}, we detected a sign-in from a new device:</p>
      <p><strong>${deviceInfo}</strong></p>
      <p>If this was you, no action is needed. If not, please secure your account immediately.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/security" class="btn">Secure My Account</a>
    `),
  })
}
