import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import { UserModel } from '@/lib/models/User'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please enter email and password.',
        },
        { status: 400 },
      )
    }

    await connectDB()

    const shop = await UserModel.findOne({
      email: email.toLowerCase().trim(),
    })

    if (!shop) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password.',
        },
        { status: 401 },
      )
    }

    if (shop.role !== 'shop') {
      return NextResponse.json(
        {
          success: false,
          message:
            'This account is not registered as a shop.',
        },
        { status: 403 },
      )
    }

    if (!shop.active) {
      return NextResponse.json(
        {
          success: false,
          message: 'This shop account is inactive.',
        },
        { status: 403 },
      )
    }

    const passwordMatch = await bcrypt.compare(
      password,
      shop.password,
    )

    if (!passwordMatch) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password.',
        },
        { status: 401 },
      )
    }

    /*
     * Only mark the cookie as Secure when the actual
     * request is HTTPS.
     *
     * This is important because local development runs
     * on http://localhost.
     */
    const requestUrl = new URL(req.url)
    const isHttps = requestUrl.protocol === 'https:'

    const response = NextResponse.json({
      success: true,
      message: 'Shop login successful.',
      user: {
        id: shop._id.toString(),
        name: shop.name,
        email: shop.email,
        phone: shop.phone,
        role: shop.role,
      },
    })

    response.cookies.set(
      'resqroute_user',
      shop._id.toString(),
      {
        httpOnly: true,
        secure: isHttps,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      },
    )

    return response
  } catch (error) {
    console.error(
      'Shop login error:',
      error,
    )

    return NextResponse.json(
      {
        success: false,
        message:
          'Something went wrong. Please try again.',
      },
      { status: 500 },
    )
  }
}