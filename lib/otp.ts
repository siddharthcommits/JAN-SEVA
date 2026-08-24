import nodemailer from 'nodemailer'
import prisma from '@/lib/prisma'

// Gmail SMTP transporter — sends OTPs to ANY email address
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

// Generate a 6-digit numeric OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Store OTP in database (expires in 10 minutes)
export async function createOTP(email: string): Promise<string> {
  const code = generateOTP()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 min

  // Invalidate any previous unused OTPs for this email
  await prisma.otpCode.updateMany({
    where: { email, used: false },
    data: { used: true },
  })

  await prisma.otpCode.create({
    data: { email, code, expiresAt },
  })

  return code
}

// Verify OTP from database
export async function verifyOTP(email: string, code: string): Promise<{ valid: boolean; message: string }> {
  const otp = await prisma.otpCode.findFirst({
    where: { email, code, used: false },
    orderBy: { createdAt: 'desc' },
  })

  if (!otp) {
    return { valid: false, message: 'Invalid OTP code. Please try again.' }
  }

  if (new Date() > otp.expiresAt) {
    await prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } })
    return { valid: false, message: 'OTP has expired. Please request a new one.' }
  }

  // Mark as used
  await prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } })

  return { valid: true, message: 'OTP verified successfully.' }
}

// Send OTP via email using Gmail SMTP
export async function sendOTPEmail(email: string, code: string): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"JAN-SEVA" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Your JAN-SEVA Verification Code: ${code}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Arial,sans-serif;">
            <div style="max-width:480px;margin:40px auto;background:#111;border:1px solid #222;border-radius:16px;overflow:hidden;">
              
              <!-- Header -->
              <div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:32px 40px;text-align:center;border-bottom:1px solid #222;">
                <div style="display:inline-block;background:#38bdf8;color:#0a0a0a;font-weight:900;font-size:14px;letter-spacing:0.2em;padding:6px 16px;border-radius:6px;margin-bottom:12px;">
                  JAN-SEVA
                </div>
                <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0;letter-spacing:-0.5px;">
                  Identity Verification
                </h1>
              </div>

              <!-- Body -->
              <div style="padding:40px;">
                <p style="color:#aaa;font-size:14px;margin:0 0 24px;">
                  Welcome! Use the code below to verify your identity and activate your JAN-SEVA account.
                </p>

                <!-- OTP Box -->
                <div style="background:#0a0a0a;border:2px solid #38bdf8;border-radius:12px;padding:28px;text-align:center;margin:0 0 24px;box-shadow:0 0 30px rgba(56,189,248,0.1);">
                  <p style="color:#aaa;font-size:11px;font-weight:700;letter-spacing:0.2em;margin:0 0 12px;text-transform:uppercase;">
                    Your Verification Code
                  </p>
                  <div style="font-size:42px;font-weight:900;letter-spacing:0.3em;color:#38bdf8;font-family:monospace;">
                    ${code}
                  </div>
                  <p style="color:#555;font-size:11px;margin:12px 0 0;font-weight:600;">
                    ⏱ Expires in 10 minutes
                  </p>
                </div>

                <div style="background:#1a1a1a;border-radius:8px;padding:16px;margin:0 0 24px;">
                  <p style="color:#666;font-size:12px;margin:0;">
                    🔒 <strong style="color:#888;">Security Notice:</strong> This code is confidential. JAN-SEVA will never ask for this code via phone or chat.
                  </p>
                </div>

                <p style="color:#555;font-size:12px;margin:0;">
                  If you didn't request this code, you can safely ignore this email. Your account will not be created.
                </p>
              </div>

              <!-- Footer -->
              <div style="padding:20px 40px;border-top:1px solid #1a1a1a;text-align:center;">
                <p style="color:#444;font-size:11px;margin:0;">
                  &copy; ${new Date().getFullYear()} JAN-SEVA Civic Platform &bull; Powered by Public Trust
                </p>
              </div>

            </div>
          </body>
        </html>
      `,
    })

    return true
  } catch (err) {
    console.error('Failed to send OTP email:', err)
    return false
  }
}
