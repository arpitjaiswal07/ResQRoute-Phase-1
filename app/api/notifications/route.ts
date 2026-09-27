import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

import { connectDB } from '@/lib/mongodb'
import { UserModel } from '@/lib/models/User'
import { ShopModel } from '@/lib/models/Shop'
import { NotificationModel } from '@/lib/models/Notification'

export async function GET() {
  try {
    const cookieStore =
      await cookies()

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
        '_id role active',
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

    let recipientId = userId
    let recipientRole:
      | 'user'
      | 'shop' = 'user'

    if (user.role === 'shop') {
      const shop =
        await ShopModel.findOne({
          ownerId: user._id,
          active: true,
        }).select('_id')

      if (!shop) {
        return NextResponse.json(
          {
            error:
              'Shop profile not found',
          },
          { status: 404 },
        )
      }

      recipientId =
        shop._id.toString()

      recipientRole = 'shop'
    }

    const notifications =
      await NotificationModel.find({
        recipientId,
        recipientRole,
      })
        .sort({
          createdAt: -1,
        })
        .limit(50)
        .lean()

    const unreadCount =
      await NotificationModel.countDocuments(
        {
          recipientId,
          recipientRole,
          read: false,
        },
      )

    return NextResponse.json({
      notifications,
      unreadCount,
    })
  } catch (error) {
    console.error(
      'Notification fetch error:',
      error,
    )

    return NextResponse.json(
      {
        error:
          'Unable to load notifications',
      },
      { status: 500 },
    )
  }
}

export async function PATCH(
  req: Request,
) {
  try {
    const body = await req.json()

    await connectDB()

    const cookieStore =
      await cookies()

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

    const user =
      await UserModel.findById(
        userId,
      ).select(
        '_id role active',
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

    let recipientId = userId
    let recipientRole:
      | 'user'
      | 'shop' = 'user'

    if (user.role === 'shop') {
      const shop =
        await ShopModel.findOne({
          ownerId: user._id,
          active: true,
        }).select('_id')

      if (!shop) {
        return NextResponse.json(
          {
            error:
              'Shop profile not found',
          },
          { status: 404 },
        )
      }

      recipientId =
        shop._id.toString()

      recipientRole = 'shop'
    }

    /*
     * Mark all notifications as read.
     */
    if (body?.all === true) {
      await NotificationModel.updateMany(
        {
          recipientId,
          recipientRole,
          read: false,
        },
        {
          $set: {
            read: true,
          },
        },
      )

      return NextResponse.json({
        success: true,
      })
    }

    /*
     * Mark one notification as read.
     */
    if (body?.notificationId) {
      await NotificationModel.updateOne(
        {
          _id: body.notificationId,
          recipientId,
          recipientRole,
        },
        {
          $set: {
            read: true,
          },
        },
      )

      return NextResponse.json({
        success: true,
      })
    }

    return NextResponse.json(
      {
        error:
          'notificationId or all is required',
      },
      { status: 400 },
    )
  } catch (error) {
    console.error(
      'Notification update error:',
      error,
    )

    return NextResponse.json(
      {
        error:
          'Unable to update notification',
      },
      { status: 500 },
    )
  }
}