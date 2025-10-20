'use client'
// 移除 import { SessionProvider } from 'next-auth/react'

import { LocaleProvider } from './lib/locale-context'

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    // 移除 <SessionProvider>
    // 留下你的本地上下文 Provider
    <LocaleProvider>
      {children}
    </LocaleProvider>
    // 移除 </SessionProvider>
  )
}