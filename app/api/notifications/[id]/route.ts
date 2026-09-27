import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

import { connectDB } from '@/lib/mongodb'
import { UserModel } from '@/lib/models/User'
import { ShopModel } from '@/lib/models/Shop'
import { NotificationModel } from '@/lib/models/Notification'

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>
  },
) {
  try {
    const { id } = await params

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

    const notification =
      await NotificationModel.findOneAndUpdate(
        {
          _id: id,
          recipientId,
          recipientRole,
        },
        {
          $set: {
            read: true,
          },
        },
        {
          new: true,
        },
      ).lean()

    if (!notification) {
      return NextResponse.json(
        {
          error:
            'Notification not found',
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      notification,
    })
  } catch (error) {
    console.error(
      'Single notification update error:',
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