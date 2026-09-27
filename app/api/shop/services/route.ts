import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

import { connectDB } from '@/lib/mongodb'
import { UserModel } from '@/lib/models/User'
import { ShopModel } from '@/lib/models/Shop'

const DEFAULT_SERVICES = {
  vehicleRepair: true,
  emergencyAssistance: true,
}

type ServiceKey =
  | 'vehicleRepair'
  | 'emergencyAssistance'

function getServices(shop: {
  services?: {
    vehicleRepair?: boolean
    emergencyAssistance?: boolean
  }
}) {
  return {
    vehicleRepair:
      shop.services?.vehicleRepair ??
      DEFAULT_SERVICES.vehicleRepair,

    emergencyAssistance:
      shop.services?.emergencyAssistance ??
      DEFAULT_SERVICES.emergencyAssistance,
  }
}

async function getAuthenticatedShop() {
  const cookieStore = await cookies()

  const userId =
    cookieStore.get('resqroute_user')?.value

  if (!userId) {
    return {
      error: NextResponse.json(
        {
          success: false,
          message: 'Not authenticated',
        },
        { status: 401 },
      ),
    }
  }

  await connectDB()

  const user = await UserModel.findById(userId).select(
    'role active',
  )

  if (
    !user ||
    !user.active ||
    user.role !== 'shop'
  ) {
    return {
      error: NextResponse.json(
        {
          success: false,
          message: 'Shop account not found',
        },
        { status: 403 },
      ),
    }
  }

  const shop = await ShopModel.findOne({
    ownerId: user._id,
    active: true,
  })

  if (!shop) {
    return {
      error: NextResponse.json(
        {
          success: false,
          message: 'Shop profile not found',
        },
        { status: 404 },
      ),
    }
  }

  return {
    user,
    shop,
  }
}

export async function GET() {
  try {
    const result = await getAuthenticatedShop()

    if ('error' in result) {
      return result.error
    }

    const { shop } = result

    return NextResponse.json({
      success: true,
      services: getServices(shop),
    })
  } catch (error) {
    console.error(
      'Service fetch error:',
      error,
    )

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch services',
      },
      { status: 500 },
    )
  }
}

export async function PATCH(
  request: Request,
) {
  try {
    const result = await getAuthenticatedShop()

    if ('error' in result) {
      return result.error
    }

    const { user, shop } = result

    const body = await request.json()

    const service =
      body?.service as ServiceKey

    const enabled = body?.enabled

    if (
      service !== 'vehicleRepair' &&
      service !== 'emergencyAssistance'
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid service',
        },
        { status: 400 },
      )
    }

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          message: 'Enabled must be boolean',
        },
        { status: 400 },
      )
    }

    /*
     * Update the actual shop profile.
     *
     * The shop profile is what customer-facing
     * service availability should use.
     */
    shop.services = {
      vehicleRepair:
        shop.services?.vehicleRepair ??
        DEFAULT_SERVICES.vehicleRepair,

      emergencyAssistance:
        shop.services?.emergencyAssistance ??
        DEFAULT_SERVICES.emergencyAssistance,
    }

    shop.services[service] = enabled

    await shop.save()

    /*
     * Keep the shop user's service preferences
     * synchronized as well.
     */
    await UserModel.findByIdAndUpdate(
      user._id,
      {
        $set: {
          [`services.${service}`]: enabled,
        },
      },
      {
        runValidators: true,
      },
    )

    return NextResponse.json({
      success: true,
      message: 'Service updated successfully',
      services: getServices(shop),
    })
  } catch (error) {
    console.error(
      'Service update error:',
      error,
    )

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update service',
      },
      { status: 500 },
    )
  }
}