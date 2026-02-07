import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from './lib/auth'

export async function middleware(request: NextRequest) {
    const currentUser = request.cookies.get('session')?.value
    const path = request.nextUrl.pathname

    if (path.startsWith('/dashboard') && !currentUser) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if ((path === '/login' || path === '/register' || path === '/' || path === '/setup') && currentUser) {
        // If user is logged in, verify session validity first
        const payload = await decrypt(currentUser);
        if (payload) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    // Check if we need to setup
    // We can't easily check DB in middleware (edge), so we skip the "redirect to setup if no company" logic here. 
    // We rely on the page logic or a separate check.

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
