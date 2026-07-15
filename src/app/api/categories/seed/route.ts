import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { categorySubCategories, navCategories } from '@/lib/categories'

/** Seed default categories from the current storefront nav structure (admin only, idempotent) */
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existing = await db.category.count()
    if (existing > 0) {
      return NextResponse.json({
        message: 'Categories already seeded',
        count: existing,
      })
    }

    let sortOrder = 0
    for (const nav of navCategories) {
      const subs = categorySubCategories[nav.value] || nav.subcategories || []
      const specialType =
        nav.value === 'new-arrivals' || nav.value === 'prime-drop' ? nav.value : null

      await db.category.create({
        data: {
          slug: nav.value,
          label: nav.label,
          highlight: Boolean(nav.highlight),
          showInNav: true,
          sortOrder: sortOrder++,
          specialType,
          heroTitle: nav.label,
          heroSubtitle: specialType === 'prime-drop' ? 'UP TO 50% OFF' : undefined,
          isActive: true,
          subcategories: {
            create: subs.map((sub, index) => ({
              slug: sub.value,
              label: sub.label,
              sortOrder: index,
              isActive: true,
            })),
          },
        },
      })
    }

    // Backfill product placement flags from legacy badge / hasFlash
    const products = await db.product.findMany({
      select: { id: true, badge: true, hasFlash: true },
    })
    for (const p of products) {
      const isNewArrival = p.hasFlash || p.badge === 'New'
      const isPrimeDrop =
        !!p.badge && ['Premium', 'Best Seller', 'Popular'].includes(p.badge)
      if (isNewArrival || isPrimeDrop) {
        await db.product.update({
          where: { id: p.id },
          data: { isNewArrival, isPrimeDrop },
        })
      }
    }

    const count = await db.category.count()
    return NextResponse.json({ message: 'Categories seeded', count })
  } catch (error) {
    console.error('Seed categories error:', error)
    return NextResponse.json({ error: 'Failed to seed categories' }, { status: 500 })
  }
}
