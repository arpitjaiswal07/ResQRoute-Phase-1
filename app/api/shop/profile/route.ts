import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

import { connectDB } from '@/lib/mongodb'
import { UserModel } from '@/lib/models/User'
import {
  ShopModel,
  type ShopDocument,
} from '@/lib/models/Shop'

export async function GET() {
  try {
    const cookieStore = await cookies()

    const userId =
      cookieStore.get('resqroute_user')?.value

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Not authenticated',
        },
        { status: 401 },
      )
    }

    await connectDB()

    const user = await UserModel.findById(userId).select(
      'name email phone role active',
    )

    if (
      !user ||
      !user.active ||
      user.role !== 'shop'
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Shop account not found',
        },
        { status: 403 },
      )
    }

    const shop = (await ShopModel.findOne({
      ownerId: user._id,
      active: true,
    }).lean()) as ShopDocument | null

    if (!shop) {
      return NextResponse.json(
        {
          success: false,
          message: 'Shop profile not found',
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,

      shop: {
        id: shop._id.toString(),

        name: shop.name,

        email: user.email,

        phone:
          shop.phone ||
          user.phone ||
          '',

        category: shop.category,

        rating:
          shop.rating ?? 0,

        reviews:
          shop.reviews ?? 0,

        open:
          shop.open ?? true,

        verified:
          shop.verified ?? false,

        active:
          shop.active ?? true,

        services: {
          vehicleRepair:
            shop.services?.vehicleRepair ??
            true,

          emergencyAssistance:
            shop.services
              ?.emergencyAssistance ??
            true,
        },

        // Keep coordinates at the top level
        // because ShopProfile in the dashboard
        // expects shop.lat and shop.lng.
        lat: shop.lat,
        lng: shop.lng,

        address:
          shop.address || '',

        whatsapp:
          shop.whatsapp || '',

        tags:
          shop.tags || [],

        source:
          shop.source || 'database',
      },
    })
  } catch (error) {
    console.error(
      'Shop profile fetch error:',
      error,
    )

    return NextResponse.json(
      {
        success: false,
        message:
          'Failed to fetch shop profile',
      },
      { status: 500 },
    )
  }
}

export async function PATCH(
  request: Request,
) {
  try {
    const cookieStore =
      await cookies()

    const userId =
      cookieStore.get('resqroute_user')?.value

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Not authenticated',
        },
        { status: 401 },
      )
    }

    await connectDB()

    const user =
      await UserModel.findById(
        userId,
      ).select(
        'name email phone role active',
      )

    if (
      !user ||
      !user.active ||
      user.role !== 'shop'
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Shop account not found',
        },
        { status: 403 },
      )
    }

    const shop =
      await ShopModel.findOne({
        ownerId: user._id,
        active: true,
      })

    if (!shop) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Shop profile not found',
        },
        { status: 404 },
      )
    }

    const body =
      await request.json()

    const {
      name,
      phone,
      address,
      whatsapp,
      open,
    } = body

    // Validate name
    if (
      name !== undefined &&
      (
        typeof name !== 'string' ||
        name.trim().length < 2
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Business name must contain at least 2 characters',
        },
        { status: 400 },
      )
    }

    // Validate phone
    if (
      phone !== undefined &&
      typeof phone !== 'string'
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Phone number must be text',
        },
        { status: 400 },
      )
    }

    // Validate address
    if (
      address !== undefined &&
      typeof address !== 'string'
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Address must be text',
        },
        { status: 400 },
      )
    }

    // Validate WhatsApp
    if (
      whatsapp !== undefined &&
      typeof whatsapp !== 'string'
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'WhatsApp number must be text',
        },
        { status: 400 },
      )
    }

    // Validate availability
    if (
      open !== undefined &&
      typeof open !== 'boolean'
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Open status must be boolean',
        },
        { status: 400 },
      )
    }

    // Update only supplied fields
    if (name !== undefined) {
      shop.name =
        name.trim()
    }

    if (phone !== undefined) {
      shop.phone =
        phone.trim()
    }

    if (address !== undefined) {
      shop.address =
        address.trim()
    }

    if (whatsapp !== undefined) {
      shop.whatsapp =
        whatsapp.trim()
    }

    if (open !== undefined) {
      shop.open = open
    }

    await shop.save()

    // Keep user's basic profile name/phone
    // synchronized with the shop profile.
    const userUpdates: {
      name?: string
      phone?: string
    } = {}

    if (name !== undefined) {
      userUpdates.name =
        name.trim()
    }

    if (phone !== undefined) {
      userUpdates.phone =
        phone.trim()
    }

    if (
      Object.keys(userUpdates).length > 0
    ) {
      await UserModel.findByIdAndUpdate(
        userId,
        {
          $set: userUpdates,
        },
      )
    }

    return NextResponse.json({
      success: true,

      message:
        'Shop profile updated successfully',

      shop: {
        id: shop._id.toString(),

        name: shop.name,

        email: user.email,

        phone:
          shop.phone ||
          user.phone ||
          '',

        category:
          shop.category,

        rating:
          shop.rating ?? 0,

        reviews:
          shop.reviews ?? 0,

        open:
          shop.open ?? true,

        verified:
          shop.verified ?? false,

        active:
          shop.active ?? true,

        services: {
          vehicleRepair:
            shop.services?.vehicleRepair ??
            true,

          emergencyAssistance:
            shop.services
              ?.emergencyAssistance ??
            true,
        },

        // Keep coordinates at the top level
        // so the dashboard receives
        // shop.lat and shop.lng.
        lat: shop.lat,
        lng: shop.lng,

        address:
          shop.address || '',

        whatsapp:
          shop.whatsapp || '',

        tags:
          shop.tags || [],

        source:
          shop.source || 'database',
      },
    })
  } catch (error) {
    console.error(
      'Shop profile update error:',
      error,
    )

    return NextResponse.json(
      {
        success: false,
        message:
          'Failed to update shop profile',
      },
      { status: 500 },
    )
  }
}