import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

const profileSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  shippingAddress: true,
  city: true,
  state: true,
  zipCode: true,
  role: true,
  createdAt: true,
} as const

function optionalTrimmedString(value: unknown): string | null | undefined {
  if (value === undefined) return undefined
  if (value === null) return null
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed || null
}

/** Current authenticated customer profile */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: profileSelect,
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Account me GET error:', error)
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 })
  }
}

/** Update profile fields and/or password */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : undefined
    const email =
      typeof body.email === 'string' ? body.email.trim().toLowerCase() : undefined
    const phone = optionalTrimmedString(body.phone)
    const shippingAddress = optionalTrimmedString(body.shippingAddress)
    const city = optionalTrimmedString(body.city)
    const state = optionalTrimmedString(body.state)
    const zipCode = optionalTrimmedString(body.zipCode)
    const currentPassword =
      typeof body.currentPassword === 'string' ? body.currentPassword : undefined
    const newPassword =
      typeof body.newPassword === 'string' ? body.newPassword : undefined

    const existing = await db.user.findUnique({
      where: { id: session.user.id },
    })
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const data: {
      name?: string
      email?: string
      phone?: string | null
      shippingAddress?: string | null
      city?: string | null
      state?: string | null
      zipCode?: string | null
      password?: string
    } = {}

    if (name !== undefined) {
      if (name.length < 2) {
        return NextResponse.json(
          { error: 'Name must be at least 2 characters' },
          { status: 400 }
        )
      }
      data.name = name
    }

    if (email !== undefined) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
      }
      if (email !== existing.email) {
        const taken = await db.user.findUnique({ where: { email } })
        if (taken) {
          return NextResponse.json(
            { error: 'Email is already in use' },
            { status: 400 }
          )
        }
        data.email = email
      }
    }

    if (phone !== undefined) data.phone = phone
    if (shippingAddress !== undefined) data.shippingAddress = shippingAddress
    if (city !== undefined) data.city = city
    if (state !== undefined) data.state = state
    if (zipCode !== undefined) data.zipCode = zipCode

    if (newPassword !== undefined) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required' },
          { status: 400 }
        )
      }
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'New password must be at least 6 characters' },
          { status: 400 }
        )
      }
      const valid = await bcrypt.compare(currentPassword, existing.password)
      if (!valid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        )
      }
      data.password = await bcrypt.hash(newPassword, 12)
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No changes provided' }, { status: 400 })
    }

    const user = await db.user.update({
      where: { id: session.user.id },
      data,
      select: profileSelect,
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Account me PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
