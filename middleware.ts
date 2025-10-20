import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // 检查会话 (Session Check)
  // NextAuth v4 default cookie names
  const hasSession = req.cookies.has('next-auth.session-token') || req.cookies.has('__Secure-next-auth.session-token')

  // 如果用户试图访问受保护页面且没有会话，则重定向到登录页
  if (!hasSession && pathname !== '/signin') {
    const url = req.nextUrl.clone()
    url.pathname = '/signin'
    url.searchParams.set('callbackUrl', req.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// 核心优化：使用 Matcher 排除所有不应执行中间件的路径
export const config = {
  matcher: [
    // 匹配除以下之外的所有请求 (包括 NextAuth 内部路由)
    '/((?!api/auth|_next/static|_next/image|favicon.ico|signin).*)',
  ],
}