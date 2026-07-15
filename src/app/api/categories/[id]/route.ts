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
  subcategories: { orderBy: { sortOrder: 'asc' as const } },
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const category = await db.category.findUnique({
      where: { id },
      include: categoryInclude,
    })
    if (!category) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(category)
  } catch (error) {
    console.error('Category GET error:', error)
    return NextResponse.json({ error: 'Failed to load category' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const category = await db.category.update({
      where: { id },
      data: {
        ...(body.label !== undefined ? { label: String(body.label).trim() } : {}),
        ...(body.slug !== undefined
          ? {
              slug: String(body.slug)
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9-]+/g, '-')
                .replace(/^-|-$/g, ''),
            }
          : {}),
        ...(body.highlight !== undefined ? { highlight: Boolean(body.highlight) } : {}),
        ...(body.showInNav !== undefined ? { showInNav: Boolean(body.showInNav) } : {}),
        ...(body.sortOrder !== undefined ? { sortOrder: Number(body.sortOrder) || 0 } : {}),
        ...(body.specialType !== undefined ? { specialType: body.specialType || null } : {}),
        ...(body.heroTitle !== undefined ? { heroTitle: body.heroTitle || null } : {}),
        ...(body.heroSubtitle !== undefined ? { heroSubtitle: body.heroSubtitle || null } : {}),
        ...(body.heroDescription !== undefined
          ? { heroDescription: body.heroDescription || null }
          : {}),
        ...(body.heroImageLeft !== undefined ? { heroImageLeft: body.heroImageLeft || null } : {}),
        ...(body.heroImageRight !== undefined
          ? { heroImageRight: body.heroImageRight || null }
          : {}),
        ...(body.isActive !== undefined ? { isActive: Boolean(body.isActive) } : {}),
      },
      include: categoryInclude,
    })

    // Replace subcategories when provided
    if (Array.isArray(body.subcategories)) {
      await db.subCategory.deleteMany({ where: { categoryId: id } })
      if (body.subcategories.length > 0) {
        await db.subCategory.createMany({
          data: body.subcategories.map(
            (
              sub: {
                slug: string
                label: string
                sortOrder?: number
                isActive?: boolean
                heroImageLeft?: string
                heroImageRight?: string
              },
              index: number
            ) => ({
              categoryId: id,
              slug: String(sub.slug)
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9-]+/g, '-')
                .replace(/^-|-$/g, ''),
              label: String(sub.label).trim(),
              sortOrder: sub.sortOrder ?? index,
              isActive: sub.isActive !== false,
              heroImageLeft: sub.heroImageLeft || null,
              heroImageRight: sub.heroImageRight || null,
            })
          ),
        })
      }
    }

    const fresh = await db.category.findUnique({
      where: { id },
      include: categoryInclude,
    })

    return NextResponse.json(fresh ?? category)
  } catch (error) {
    console.error('Category PUT error:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await db.category.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Category DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
