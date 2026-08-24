import { NextResponse } from 'next/server'
import { verifyOTP } from '@/lib/otp'
import prisma from '@/lib/prisma'

export const dynamic = "force-dynamic";
import bcrypt from 'bcryptjs'

function generateAnonymousName(fullName: string) {
  const initials = fullName
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 3)
    .toUpperCase()
  const suffix = Math.floor(1000 + Math.random() * 9000)
  return `${initials}-${suffix}`
}

export async function POST(req: Request) {
  try {
    const { email, code, fullName, password, phone } = await req.json()

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and OTP code are required' }, { status: 400 })
    }

    // Verify OTP
    const result = await verifyOTP(email, code)
    if (!result.valid) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    // If user already exists (re-verification case), just mark as verified
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      await prisma.user.update({ where: { email }, data: { verified: true } })
      return NextResponse.json({
        message: 'Email verified!',
        user: { id: existingUser.id, anonymousName: existingUser.anonymousName, email },
      })
    }

    // Create new verified user
    if (!fullName || !password) {
      return NextResponse.json({ error: 'Full name and password required to create account' }, { status: 400 })
    }

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    let anonymousName = generateAnonymousName(fullName)
    let attempts = 0
    while (await prisma.user.findUnique({ where: { anonymousName } })) {
      anonymousName = generateAnonymousName(fullName)
      if (++attempts > 10) break
    }

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash: hash,
        phone: phone || null,
        anonymousName,
        verified: true, // Verified via OTP
        role: 'USER',
      },
    })

    return NextResponse.json(
      {
        message: 'Registration successful!',
        user: { id: user.id, anonymousName: user.anonymousName, email: user.email },
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('verify-otp error:', err)
    return NextResponse.json({ error: 'Server error during verification' }, { status: 500 })
  }
}
