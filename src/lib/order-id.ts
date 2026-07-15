import { db } from '@/lib/db'

/**
 * Format: GBB-{year}-{MMDD}-{3-digit random}
 * Example: GBB-2026-0713-482
 */
export function formatOrderId(date = new Date(), random = randomThreeDigits()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `GBB-${year}-${month}${day}-${random}`
}

function randomThreeDigits(): string {
  return String(Math.floor(Math.random() * 1000)).padStart(3, '0')
}

/** Generate a unique GBB order id, retrying on collision */
export async function createUniqueOrderId(maxAttempts = 20): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const id = formatOrderId()
    const existing = await db.order.findUnique({
      where: { id },
      select: { id: true },
    })
    if (!existing) return id
  }
  // Extremely unlikely fallback: include seconds for uniqueness
  const now = new Date()
  const secs = String(now.getSeconds()).padStart(2, '0')
  return formatOrderId(now, `${randomThreeDigits().slice(0, 1)}${secs}`)
}
