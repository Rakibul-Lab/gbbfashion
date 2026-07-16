import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { findProductByParam, resolveProductSlugInput } from '@/lib/product-slug-db'
import { inStockFromQuantity, normalizeStock } from '@/lib/stock'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await findProductByParam(id)

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product, {
      headers: {
        // Avoid stale product payloads (esp. new images) after admin create/update
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Product GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const existing = await findProductByParam(id)
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const body = await request.json()
    const stock = normalizeStock(body.stock, 0)
    const slug = await resolveProductSlugInput({
      name: String(body.name ?? existing.name),
      image: body.image ?? existing.image,
      excludeId: existing.id,
    })

    const product = await db.product.update({
      where: { id: existing.id },
      data: {
        name: body.name,
        slug,
        description: body.description,
        price: body.price,
        originalPrice: body.originalPrice ?? null,
        category: body.category,
        image: body.image,
        secondaryImage: body.secondaryImage ?? null,
        galleryImages: body.galleryImages ?? null,
        features: body.features,
        rating: body.rating,
        stock,
        inStock: inStockFromQuantity(stock),
        badge: body.badge ?? null,
        colors: body.colors ?? null,
        collection: body.collection ?? null,
        hasFlash: body.hasFlash ?? false,
        subCategory: body.subCategory ?? null,
        isNewArrival: body.isNewArrival ?? false,
        isPrimeDrop: body.isPrimeDrop ?? false,
        isFeatured: body.isFeatured ?? false,
        sortOrder: body.sortOrder ?? 0,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Product PUT error:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const existing = await findProductByParam(id)
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    await db.product.delete({ where: { id: existing.id } })
    return NextResponse.json({ message: 'Product deleted' })
  } catch (error) {
    console.error('Product DELETE error:', error)
    const message =
      error instanceof Error && /foreign key constraint/i.test(error.message)
        ? 'Cannot delete this product yet. Run prisma/product-delete-set-null.sql on the database, then try again.'
        : 'Failed to delete product'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
