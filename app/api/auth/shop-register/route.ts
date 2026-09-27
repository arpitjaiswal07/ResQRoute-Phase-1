import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import { UserModel } from '@/lib/models/User'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
    } = body

    // Validation
    if (!name || !email || !phone || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Please fill all fields.' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match.' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters.' },
        { status: 400 }
      )
    }

    await connectDB()

    // Check existing account
    const existingUser = await UserModel.findOne({
      email: email.toLowerCase().trim(),
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists.' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create shop account
    const shop = await UserModel.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: hashedPassword,
      role: 'shop',
      active: true,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Shop account created successfully.',
        shop: {
          id: shop._id.toString(),
          name: shop.name,
          email: shop.email,
          phone: shop.phone,
          role: shop.role,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Shop registration error:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Something went wrong while creating the shop account.',
      },
      { status: 500 }
    )
  }
}