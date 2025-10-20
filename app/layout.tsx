import './globals.css'
import { Inter } from 'next/font/google'
import ClientProviders from './ClientProviders'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  title: 'Asset Management System',
  description: '构建您职业生涯的下一块敲门砖',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <ClientProviders>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/20">
            {children}
          </div>
        </ClientProviders>
      </body>
    </html>
  )
}