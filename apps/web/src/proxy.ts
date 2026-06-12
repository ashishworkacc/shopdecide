// Next.js 16: proxy.ts replaces middleware.ts
// Defence-in-depth redirect only — real auth guard lives in (app)/layout.tsx
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Let auth API and static files through
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.match(/\.(png|jpg|svg|ico|webp)$/)
  ) {
    return NextResponse.next()
  }

  // Check for session token cookie (set by NextAuth)
  const hasSession =
    request.cookies.has('next-auth.session-token') ||
    request.cookies.has('__Secure-next-auth.session-token')

  const isAuthPage = pathname.startsWith('/auth')

  if (!hasSession && !isAuthPage) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }
  if (hasSession && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export default proxy

export const config = {
  runtime: 'nodejs',
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
}
