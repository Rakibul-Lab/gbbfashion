import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const reel = await db.reel.findUnique({
      where: { id },
    })

    if (!reel) {
      return NextResponse.json({ error: 'Reel not found' }, { status: 404 })
    }

    return NextResponse.json(reel)
  } catch (error) {
    console.error('Reel GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reel' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existingReel = await db.reel.findUnique({
      where: { id },
    })

    if (!existingReel) {
      return NextResponse.json({ error: 'Reel not found' }, { status: 404 })
    }

    const reel = await db.reel.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.productName !== undefined && { productName: body.productName }),
        ...(body.price !== undefined && { price: body.price }),
        ...(body.originalPrice !== undefined && { originalPrice: body.originalPrice }),
        ...(body.videoSrc !== undefined && { videoSrc: body.videoSrc }),
        ...(body.videoThumbnail !== undefined && { videoThumbnail: body.videoThumbnail }),
        ...(body.thumbnail !== undefined && { thumbnail: body.thumbnail }),
        ...(body.colors !== undefined && { colors: body.colors }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      },
    })

    return NextResponse.json(reel)
  } catch (error) {
    console.error('Reel PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update reel' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existingReel = await db.reel.findUnique({
      where: { id },
    })

    if (!existingReel) {
      return NextResponse.json({ error: 'Reel not found' }, { status: 404 })
    }

    await db.reel.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Reel deleted successfully' })
  } catch (error) {
    console.error('Reel DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete reel' },
      { status: 500 }
    )
  }
}
