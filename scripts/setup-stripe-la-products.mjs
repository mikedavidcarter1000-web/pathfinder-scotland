#!/usr/bin/env node
// Manual setup script: creates the Stripe products and prices for the
// Pathfinder Local Authority Portal tier.
//
// USAGE:
//   1. Set STRIPE_SECRET_KEY in your environment (use a TEST-mode key first).
//   2. node scripts/setup-stripe-la-products.mjs
//   3. Copy the printed price IDs into .env.local under the env_var names
//      defined in data/stripe-la-products.json.
//
// This script is intentionally NOT wired into npm scripts and is NOT
// invoked during build or CI. Stripe product / price creation is
// irreversible (you can deactivate but not delete) so this is a manual,
// one-off operation per Stripe account / mode.
//
// Idempotency: the script searches for an existing product by name
// before creating a new one, so re-running is safe -- it will reuse the
// existing product, but it WILL create a new price each run unless you
// pass --skip-existing-prices.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import Stripe from 'stripe'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CONFIG_PATH = join(__dirname, '..', 'data', 'stripe-la-products.json')

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('ERROR: STRIPE_SECRET_KEY must be set in the environment.')
  process.exit(1)
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'))
const skipExistingPrices = process.argv.includes('--skip-existing-prices')

async function findExistingProductByName(name) {
  // Stripe doesn't have a name-equality filter; search the active list.
  const list = await stripe.products.list({ active: true, limit: 100 })
  return list.data.find((p) => p.name === name) ?? null
}

async function findActivePriceForProduct(productId) {
  const list = await stripe.prices.list({ product: productId, active: true, limit: 10 })
  // Return the first recurring annual GBP price found, if any.
  return list.data.find((p) => p.currency === 'gbp' && p.recurring?.interval === 'year') ?? null
}

async function createOrReuse(spec) {
  const existingProduct = await findExistingProductByName(spec.name)
  let product
  if (existingProduct) {
    console.log(`[reuse] product "${spec.name}" -> ${existingProduct.id}`)
    product = existingProduct
  } else {
    product = await stripe.products.create({
      name: spec.name,
      description: spec.description,
      metadata: spec.stripe_metadata ?? {},
    })
    console.log(`[create] product "${spec.name}" -> ${product.id}`)
  }

  if (skipExistingPrices) {
    const existingPrice = await findActivePriceForProduct(product.id)
    if (existingPrice) {
      console.log(`  [reuse] price ${existingPrice.id} (${spec.env_var})`)
      return { spec, productId: product.id, priceId: existingPrice.id }
    }
  }

  const price = await stripe.prices.create({
    product: product.id,
    currency: 'gbp',
    unit_amount: spec.price_gbp_per_year * 100, // pence
    recurring: { interval: 'year' },
    metadata: spec.stripe_metadata ?? {},
  })
  console.log(`  [create] price ${price.id} -> GBP ${spec.price_gbp_per_year}/year (${spec.env_var})`)
  return { spec, productId: product.id, priceId: price.id }
}

async function main() {
  console.log('Pathfinder LA Stripe setup')
  console.log('Stripe key prefix:', process.env.STRIPE_SECRET_KEY.slice(0, 8) + '...')
  console.log('Mode:', process.env.STRIPE_SECRET_KEY.startsWith('sk_live') ? 'LIVE' : 'TEST')
  console.log('---')

  const results = []
  for (const spec of config.products) {
    // eslint-disable-next-line no-await-in-loop
    results.push(await createOrReuse(spec))
  }

  console.log('\n=== Add the following to .env.local ===\n')
  for (const r of results) {
    console.log(`${r.spec.env_var}=${r.priceId}`)
  }
  console.log('\nDone.')
}

main().catch((err) => {
  console.error('Setup failed:', err)
  process.exit(1)
})
