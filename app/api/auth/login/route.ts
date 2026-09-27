import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { connectDB } from '@/lib/mongodb'
import { UserModel } from '@/lib/models/User'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')

    if (!email || !password) {
      return NextResponse.json(
        {
          error: 'Email and password are required',
        },
        { status: 400 },
      )
    }

    await connectDB()

    const user = await UserModel.findOne({ email })

    if (!user) {
      return NextResponse.json(
        {
          error: 'Invalid email or password',
        },
        { status: 401 },
      )
    }

    if (!user.active) {
      return NextResponse.json(
        {
          error: 'This account is inactive',
        },
        { status: 403 },
      )
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password,
    )

    if (!passwordMatch) {
      return NextResponse.json(
        {
          error: 'Invalid email or password',
        },
        { status: 401 },
      )
    }

    const cookieStore = await cookies()

cookieStore.set('resqroute_user', user._id.toString(), {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
})

return NextResponse.json({
  success: true,
  message: 'Login successful',
  user: {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  },
})
  } catch (error) {
    console.error('Login error:', error)

    return NextResponse.json(
      {
        error: 'Something went wrong. Please try again.',
      },
      { status: 500 },
    )
  }
}