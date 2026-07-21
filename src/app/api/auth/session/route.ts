import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

/** Explicit session route — used by next-auth/react SessionProvider. */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    return NextResponse.json(session)
  } catch (error) {
    console.error('Auth session GET error:', error)
    return NextResponse.json({ error: 'Failed to load session' }, { status: 500 })
  }
}
