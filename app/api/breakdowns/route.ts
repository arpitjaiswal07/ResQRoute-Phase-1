import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

import { connectDB } from '@/lib/mongodb'
import { UserModel } from '@/lib/models/User'
import { ShopModel } from '@/lib/models/Shop'
import { BreakdownModel } from '@/lib/models/Breakdown'
import { NotificationModel } from '@/lib/models/Notification'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (
      !body.problem ||
      !Number.isFinite(Number(body.lat)) ||
      !Number.isFinite(Number(body.lng))
    ) {
      return NextResponse.json(
        {
          error:
            'problem, lat and lng are required',
        },
        { status: 400 },
      )
    }

    await connectDB()

    /*
     * Get currently logged-in user.
     *
     * This is optional here so that the existing
     * request flow does not break if a request
     * somehow reaches this endpoint without the cookie.
     */
    let userId = ''

    try {
      const cookieStore = await cookies()

      userId =
        cookieStore.get(
          'resqroute_user',
        )?.value || ''
    } catch {
      userId = ''
    }

    /*
     * If we have a logged-in user, verify that
     * the account exists and is a normal user.
     */
    if (userId) {
      const user =
        await UserModel.findById(
          userId,
        ).select(
          '_id role active',
        )

      if (
        !user ||
        !user.active ||
        user.role !== 'user'
      ) {
        userId = ''
      }
    }

    /*
     * Create the breakdown exactly as before,
     * with userId added for notification ownership.
     */
    const doc =
      await BreakdownModel.create({
        ...body,

        userId,

        lat: Number(body.lat),
        lng: Number(body.lng),

        status:
          body.status || 'REQUESTED',

        providerId:
          body.providerId || '',
      })

    /*
     * Notify matching active/available shops.
     *
     * Notification failure must NOT make the
     * roadside request fail.
     */
    try {
      const serviceType =
        body.serviceType ||
        'mechanics'

      const shops =
        await ShopModel.find({
          category: serviceType,
          active: true,
          open: true,
        }).select('_id')

      if (shops.length > 0) {
        const notifications =
          shops.map((shop) => ({
            recipientId:
              shop._id.toString(),

            recipientRole: 'shop' as const,

            type: 'NEW_REQUEST' as const,

            title:
              'New Assistance Request',

            message:
              `A customer needs ${serviceType} assistance nearby.`,

            breakdownId:
              doc._id.toString(),

            read: false,
          }))

        await NotificationModel.insertMany(
          notifications,
        )
      }
    } catch (notificationError) {
      console.error(
        'Shop notification creation error:',
        notificationError,
      )
    }

    return NextResponse.json(
      {
        breakdown: doc,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error(
      'Breakdown creation error:',
      error,
    )

    return NextResponse.json(
      {
        error:
          'Unable to create request',
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies()

    const userId =
      cookieStore.get(
        'resqroute_user',
      )?.value

    if (!userId) {
      return NextResponse.json(
        {
          error: 'Not authenticated',
        },
        { status: 401 },
      )
    }

    await connectDB()

    const user =
      await UserModel.findById(
        userId,
      ).select(
        'role active',
      )

    if (
      !user ||
      !user.active
    ) {
      return NextResponse.json(
        {
          error:
            'Account not found',
        },
        { status: 401 },
      )
    }

    if (user.role !== 'shop') {
      return NextResponse.json(
        {
          error:
            'Shop account required',
        },
        { status: 403 },
      )
    }

    const shop =
      await ShopModel.findOne({
        ownerId: user._id,
        active: true,
      }).select(
        '_id category services',
      )

    if (!shop) {
      return NextResponse.json(
        {
          error:
            'Shop profile not found',
        },
        { status: 404 },
      )
    }

    const shopId =
      shop._id.toString()

    const serviceType =
      shop.category

    const breakdowns =
      await BreakdownModel.find({
        $or: [
          {
            providerId: shopId,
          },
          {
            providerId: '',
            serviceType,
            status: 'REQUESTED',
          },
        ],
      })
        .sort({
          createdAt: -1,
        })
        .limit(50)
        .lean()

    return NextResponse.json({
      breakdowns,
    })
  } catch (error) {
    console.error(
      'Shop breakdown fetch error:',
      error,
    )

    return NextResponse.json(
      {
        error:
          'Unable to load requests',
      },
      { status: 500 },
    )
  }
}