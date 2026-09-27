import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

import { connectDB } from '@/lib/mongodb'
import { UserModel } from '@/lib/models/User'

export async function GET() {
  try {
    const cookieStore = await cookies()

    const userId = cookieStore.get('resqroute_user')?.value

    if (!userId) {
      return NextResponse.json(
        {
          authenticated: false,
          user: null,
        },
        { status: 401 },
      )
    }

    await connectDB()

    const user = await UserModel.findById(userId).select(
      'name email phone role active',
    )

    if (!user || !user.active) {
      return NextResponse.json(
        {
          authenticated: false,
          user: null,
        },
        { status: 401 },
      )
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Auth check error:', error)

    return NextResponse.json(
      {
        authenticated: false,
        user: null,
      },
      { status: 500 },
    )
  }
}