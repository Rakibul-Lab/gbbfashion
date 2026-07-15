import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { inStockFromQuantity, normalizeStock } from '@/lib/stock'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await db.product.findUnique({ where: { id } })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900',
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
    const body = await request.json()
    const stock = normalizeStock(body.stock, 0)

    const product = await db.product.update({
      where: { id },
      data: {
        name: body.name,
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
    await db.product.delete({ where: { id } })
    return NextResponse.json({ message: 'Product deleted' })
  } catch (error) {
    console.error('Product DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
