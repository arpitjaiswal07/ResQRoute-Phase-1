import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

import { connectDB } from '@/lib/mongodb'
import { UserModel } from '@/lib/models/User'
import { ShopModel } from '@/lib/models/Shop'

export async function PATCH(req: Request) {
  try {
    // --------------------------------------------------
    // 1. Get logged-in shop user
    // --------------------------------------------------
    const cookieStore = await cookies()
    const userId = cookieStore.get('resqroute_user')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      )
    }

    // --------------------------------------------------
    // 2. Connect to MongoDB
    // --------------------------------------------------
    await connectDB()

    // --------------------------------------------------
    // 3. Verify logged-in user
    // --------------------------------------------------
    const user = await UserModel.findById(userId)
      .select('name email phone role active')

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 },
      )
    }

    // --------------------------------------------------
    // 4. Verify active shop account
    // --------------------------------------------------
    if (user.role !== 'shop' || !user.active) {
      return NextResponse.json(
        { error: 'Shop account is not active' },
        { status: 403 },
      )
    }

    // --------------------------------------------------
    // 5. Find shop owned by logged-in user
    // --------------------------------------------------
    const shop = await ShopModel.findOne({
      ownerId: user._id,
      active: true,
    })

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop profile not found' },
        { status: 404 },
      )
    }

    // --------------------------------------------------
    // 6. Read request body
    // --------------------------------------------------
    const body = await req.json()

    const lat = Number(body?.lat)
    const lng = Number(body?.lng)

    // --------------------------------------------------
    // 7. Validate coordinates
    // --------------------------------------------------
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      return NextResponse.json(
        {
          error: 'Valid latitude and longitude are required',
        },
        { status: 400 },
      )
    }

    if (lat < -90 || lat > 90) {
      return NextResponse.json(
        {
          error: 'Latitude must be between -90 and 90',
        },
        { status: 400 },
      )
    }

    if (lng < -180 || lng > 180) {
      return NextResponse.json(
        {
          error: 'Longitude must be between -180 and 180',
        },
        { status: 400 },
      )
    }

    // --------------------------------------------------
    // 8. Update shop location
    // --------------------------------------------------
    shop.lat = lat
    shop.lng = lng

    await shop.save()

    // --------------------------------------------------
    // 9. Return updated location
    // --------------------------------------------------
    return NextResponse.json({
      success: true,
      message: 'Service location updated successfully',
      location: {
        lat: shop.lat,
        lng: shop.lng,
      },
    })
  } catch (error) {
    console.error('SHOP LOCATION UPDATE ERROR:', error)

    return NextResponse.json(
      {
        error: 'Unable to update service location',
      },
      { status: 500 },
    )
  }
}