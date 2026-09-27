import { NextResponse } from 'next/server'

import { connectDB } from '@/lib/mongodb'
import { BreakdownModel } from '@/lib/models/Breakdown'
import { NotificationModel } from '@/lib/models/Notification'

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>
  },
) {
  try {
    await connectDB()

    const { id } = await params

    const doc =
      await BreakdownModel.findById(
        id,
      ).lean()

    if (!doc) {
      return NextResponse.json(
        {
          error: 'Not found',
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      breakdown: doc,
    })
  } catch (error) {
    console.error(
      'Breakdown fetch error:',
      error,
    )

    return NextResponse.json(
      {
        error:
          'Unable to load request',
      },
      { status: 500 },
    )
  }
}

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>
  },
) {
  try {
    await connectDB()

    const { id } = await params

    const body = await req.json()

    /*
     * Only allow the same fields that were
     * already supported by your existing route.
     */
    const update = Object.fromEntries(
      Object.entries(body).filter(
        ([key]) =>
          [
            'status',
            'providerId',
          ].includes(key),
      ),
    )

    /*
     * Read old breakdown first so we can determine
     * whether the status actually changed.
     */
    const previous =
      await BreakdownModel.findById(id)

    if (!previous) {
      return NextResponse.json(
        {
          error: 'Not found',
        },
        { status: 404 },
      )
    }

    const previousStatus =
      previous.status

    const previousProviderId =
      previous.providerId || ''

    /*
     * Existing update behavior.
     */
    const doc =
      await BreakdownModel.findByIdAndUpdate(
        id,
        update,
        {
          new: true,
        },
      )

    if (!doc) {
      return NextResponse.json(
        {
          error: 'Not found',
        },
        { status: 404 },
      )
    }

    /*
     * Only create notifications when the status
     * actually changes.
     */
    const newStatus =
      doc.status

    const statusChanged =
      previousStatus !==
      newStatus

    if (statusChanged) {
      try {
        const breakdownId =
          doc._id.toString()

        const userId =
          doc.userId || ''

        /*
         * User notifications
         */
        if (userId) {
          let notification = null

          switch (newStatus) {
            case 'ASSIGNED':
              notification = {
                recipientId: userId,
                recipientRole:
                  'user' as const,
                type:
                  'REQUEST_ACCEPTED' as const,
                title:
                  'Request Accepted',
                message:
                  'A service provider has accepted your roadside assistance request.',
                breakdownId,
                read: false,
              }
              break

            case 'ON_THE_WAY':
              notification = {
                recipientId: userId,
                recipientRole:
                  'user' as const,
                type:
                  'REQUEST_ON_THE_WAY' as const,
                title:
                  'Provider Is On The Way',
                message:
                  'Your assigned service provider is heading to your location.',
                breakdownId,
                read: false,
              }
              break

            case 'ARRIVED':
              notification = {
                recipientId: userId,
                recipientRole:
                  'user' as const,
                type:
                  'REQUEST_ARRIVED' as const,
                title:
                  'Provider Arrived',
                message:
                  'Your service provider has reached your location.',
                breakdownId,
                read: false,
              }
              break

            case 'COMPLETED':
              notification = {
                recipientId: userId,
                recipientRole:
                  'user' as const,
                type:
                  'REQUEST_COMPLETED' as const,
                title:
                  'Request Completed',
                message:
                  'Your roadside assistance request has been completed.',
                breakdownId,
                read: false,
              }
              break

            case 'CANCELLED':
              notification = {
                recipientId: userId,
                recipientRole:
                  'user' as const,
                type:
                  'REQUEST_CANCELLED' as const,
                title:
                  'Request Cancelled',
                message:
                  'Your roadside assistance request has been cancelled.',
                breakdownId,
                read: false,
              }
              break

            default:
              notification = null
          }

          if (notification) {
            await NotificationModel.create(
              notification,
            )
          }
        }

        /*
         * If a shop accepts the request,
         * remove its "new request" notification
         * from unread state.
         *
         * We do not delete it because preserving
         * notification history is useful.
         */
        if (
          newStatus === 'ASSIGNED' &&
          doc.providerId
        ) {
          await NotificationModel.updateMany(
            {
              recipientId:
                doc.providerId,
              recipientRole: 'shop',
              breakdownId,
              type: 'NEW_REQUEST',
              read: false,
            },
            {
              $set: {
                read: true,
              },
            },
          )
        }

        /*
         * If request was cancelled by shop,
         * mark the corresponding shop notification
         * as read as well.
         */
        if (
          newStatus ===
          'CANCELLED'
        ) {
          const providerId =
            doc.providerId ||
            previousProviderId

          if (providerId) {
            await NotificationModel.updateMany(
              {
                recipientId:
                  providerId,
                recipientRole: 'shop',
                breakdownId,
                type: 'NEW_REQUEST',
                read: false,
              },
              {
                $set: {
                  read: true,
                },
              },
            )
          }
        }
      } catch (notificationError) {
        /*
         * IMPORTANT:
         * Notification failure must never
         * break the actual breakdown update.
         */
        console.error(
          'Breakdown notification error:',
          notificationError,
        )
      }
    }

    return NextResponse.json({
      breakdown: doc,
    })
  } catch (error) {
    console.error(
      'Breakdown update error:',
      error,
    )

    return NextResponse.json(
      {
        error:
          'Unable to update request',
      },
      { status: 500 },
    )
  }
}