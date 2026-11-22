import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/** Explicit session route — used by next-auth/react SessionProvider.
 *  Must return `{}` when logged out — next-auth client does Object.keys(data).
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    return NextResponse.json(session ?? {}, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    })
  } catch (error) {
    console.error('Auth session GET error:', error)
    // Prefer empty session over 500 so SessionProvider doesn't throw CLIENT_FETCH_ERROR
    return NextResponse.json({}, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    })
  }
}
