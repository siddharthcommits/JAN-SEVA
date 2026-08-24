import { NextResponse } from 'next/server'
import { createOTP, sendOTPEmail } from '@/lib/otp'
import prisma from '@/lib/prisma'

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    // Check if email is already registered and verified
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser && existingUser.verified) {
      return NextResponse.json({ error: 'This email is already registered. Please log in.' }, { status: 409 })
    }

    // Generate and store OTP
    const code = await createOTP(email)

    // Send OTP email
    const sent = await sendOTPEmail(email, code)

    if (!sent) {
      return NextResponse.json({ error: 'Failed to send OTP. Please check your email address.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'OTP sent successfully. Check your inbox!' }, { status: 200 })
  } catch (err) {
    console.error('send-otp error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
