import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

import { connectDB } from '@/lib/mongodb'
import { UserModel } from '@/lib/models/User'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { name, email, phone, password, confirmPassword } = body

    if (!name || !email || !phone || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Please fill all required fields.' },
        { status: 400 },
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match.' },
        { status: 400 },
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: 'Password must be at least 6 characters.',
        },
        { status: 400 },
      )
    }

    await connectDB()

    const normalizedEmail = email.trim().toLowerCase()

    const existingUser = await UserModel.findOne({
      email: normalizedEmail,
    })

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'An account with this email already exists.',
        },
        { status: 409 },
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await UserModel.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: hashedPassword,
      role: 'user',
      active: true,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully.',
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Registration error:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Something went wrong while creating your account.',
      },
      { status: 500 },
    )
  }
}
