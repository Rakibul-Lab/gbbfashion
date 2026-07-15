import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { inStockFromQuantity, normalizeStock } from '@/lib/stock'

const cacheHeaders = {
  'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}

    if (category && category !== 'all') {
      where.category = category
    }

    if (search) {
      where.OR = [
        { name: { equals: search } },
        { name: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const products = await db.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(products, { headers: cacheHeaders })
  } catch (error) {
    console.error('Products GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const stock = normalizeStock(body.stock, 100)
    const product = await db.product.create({
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
        rating: body.rating ?? 4.5,
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
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Product POST error:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
