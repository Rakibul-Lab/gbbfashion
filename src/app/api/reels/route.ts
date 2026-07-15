import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { normalizeStock } from '@/lib/stock'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'

    const reels = await db.reel.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(reels)
  } catch (error) {
    console.error('Reels GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reels' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      title,
      productName,
      price,
      originalPrice,
      videoSrc,
      videoThumbnail,
      thumbnail,
      stock,
      colors,
      isActive,
      sortOrder,
    } = body

    if (!title || !productName || price === undefined || price === null || !videoSrc) {
      return NextResponse.json(
        { error: 'Title, product name, price, and video source are required' },
        { status: 400 }
      )
    }

    if (!thumbnail) {
      return NextResponse.json(
        { error: 'Product image is required' },
        { status: 400 }
      )
    }

    const reel = await db.reel.create({
      data: {
        title,
        productName,
        price,
        originalPrice: originalPrice || null,
        videoSrc,
        videoThumbnail: videoThumbnail || thumbnail || '',
        thumbnail: thumbnail || '',
        stock: normalizeStock(stock, 0),
        colors: colors || null,
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: sortOrder || 0,
      },
    })

    return NextResponse.json(reel, { status: 201 })
  } catch (error) {
    console.error('Reels POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create reel' },
      { status: 500 }
    )
  }
}
