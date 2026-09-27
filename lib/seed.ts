import dotenv from 'dotenv'

dotenv.config({
  path: 'C:/Users/jaisw/OneDrive/Desktop/last/ResQRoute-Fixed-v3/.env.local',
})

console.log(
  'MONGODB_URI loaded:',
  process.env.MONGODB_URI ? 'YES' : 'NO'
)

const providerRows: Array<
  [
    string,
    'mechanics' | 'towing' | 'rentals',
    number,
    number,
    string,
    string,
    string[],
    number,
    number,
    string
  ]
> = [
  ['ResQ Highway Auto Care', 'mechanics', 4.8, 214, '+919876543210', '919876543210', ['Engine', 'Battery', 'Tyres'], 26.455, 80.335, 'Kanpur highway service road'],
  ['24x7 Mobile Auto Works', 'mechanics', 4.6, 158, '+919812345670', '919812345670', ['Diagnostics', 'Brakes'], 26.442, 80.325, 'Kanpur highway service road'],
  ['ResQ Heavy Towing', 'towing', 4.7, 341, '+918765432109', '918765432109', ['Flatbed', 'Heavy duty'], 26.451, 80.342, 'Kanpur highway'],
  ['Highway Recovery 24x7', 'towing', 4.5, 187, '+918790654321', '918790654321', ['Winch out', 'Accident'], 26.438, 80.318, 'NH highway corridor'],
  ['ResQ Emergency Rentals', 'rentals', 4.6, 129, '+919765432108', '919765432108', ['Instant pickup', 'SUV'], 26.460, 80.329, 'Kanpur highway'],
]

const providers = providerRows.map(
  ([name, category, rating, reviews, phone, whatsapp, tags, lat, lng, address]) => ({
    name,
    category,
    rating,
    reviews,
    phone,
    whatsapp,
    open: true,
    tags,
    lat,
    lng,
    address,
    verified: false,
    active: true,
    source: 'database',
  })
)

async function seed() {
  // IMPORTANT: imports AFTER dotenv.config()
  const { connectDB } = await import('./mongodb')
  const { ShopModel } = await import('./models/Shop')

  await connectDB()

  let inserted = 0
  let updated = 0

  for (const provider of providers) {
    const result = await ShopModel.updateOne(
      { name: provider.name },
      { $set: provider },
      { upsert: true }
    )

    if (result.upsertedCount) {
      inserted += result.upsertedCount
    } else if (result.modifiedCount) {
      updated += result.modifiedCount
    }
  }

  console.log(
    `Seed complete: ${providers.length} providers (${inserted} inserted, ${updated} updated)`
  )

  const mongoose = await import('mongoose')
  await mongoose.default.disconnect()
}

seed().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})