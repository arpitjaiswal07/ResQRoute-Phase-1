import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function main() {
  await import('./lib/seed')
}

main().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})