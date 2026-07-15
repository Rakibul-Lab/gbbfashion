import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'admin') {
    return null
  }
  return session
}

const categoryInclude = {
  subcategories: {
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' as const },
  },
}

/** Public + admin: list categories (nav uses ?nav=1) */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const navOnly = searchParams.get('nav') === '1'
    const all = searchParams.get('all') === '1'

    const categories = await db.category.findMany({
      where: all
        ? undefined
        : {
            isActive: true,
            ...(navOnly ? { showInNav: true } : {}),
          },
      include: {
        subcategories: {
          where: all ? undefined : { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })

    // Product counts per category / special placement
    const [byCategory, newArrivalCount, primeDropCount] = await Promise.all([
      db.product.groupBy({
        by: ['category'],
        _count: { _all: true },
      }),
      db.product.count({ where: { isNewArrival: true } }),
      db.product.count({ where: { isPrimeDrop: true } }),
    ])

    const countMap = Object.fromEntries(
      byCategory.map((row) => [row.category, row._count._all])
    )

    const withCounts = categories.map((cat) => {
      let productCount = countMap[cat.slug] ?? 0
      if (cat.specialType === 'new-arrivals') productCount = newArrivalCount
      if (cat.specialType === 'prime-drop') productCount = primeDropCount
      return { ...cat, productCount }
    })

    return NextResponse.json(withCounts, {
      headers: {
        'Cache-Control': navOnly
          ? 'public, s-maxage=60, stale-while-revalidate=300'
          : 'no-store',
      },
    })
  } catch (error) {
    console.error('Categories GET error:', error)
    return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const slug = String(body.slug || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-|-$/g, '')

    if (!slug || !body.label?.trim()) {
      return NextResponse.json({ error: 'Slug and label are required' }, { status: 400 })
    }

    const category = await db.category.create({
      data: {
        slug,
        label: String(body.label).trim(),
        highlight: Boolean(body.highlight),
        showInNav: body.showInNav !== false,
        sortOrder: Number(body.sortOrder) || 0,
        specialType: body.specialType || null,
        heroTitle: body.heroTitle || null,
        heroSubtitle: body.heroSubtitle || null,
        heroDescription: body.heroDescription || null,
        heroImageLeft: body.heroImageLeft || null,
        heroImageRight: body.heroImageRight || null,
        isActive: body.isActive !== false,
        subcategories: Array.isArray(body.subcategories)
          ? {
              create: body.subcategories.map(
                (
                  sub: { slug: string; label: string; sortOrder?: number },
                  index: number
                ) => ({
                  slug: String(sub.slug)
                    .trim()
                    .toLowerCase()
                    .replace(/[^a-z0-9-]+/g, '-')
                    .replace(/^-|-$/g, ''),
                  label: String(sub.label).trim(),
                  sortOrder: sub.sortOrder ?? index,
                })
              ),
            }
          : undefined,
      },
      include: categoryInclude,
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error: unknown) {
    console.error('Categories POST error:', error)
    const msg = error instanceof Error ? error.message : 'Failed to create category'
    if (String(msg).includes('Unique constraint')) {
      return NextResponse.json({ error: 'Category slug already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
