import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Full site shutdown: every route except the homepage itself redirects to
// the homepage, which now only shows the "Subscription Expired" notice.
// (Temporary 307 so browsers don't cache it permanently.)
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/') {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL('/', request.url), 307);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
