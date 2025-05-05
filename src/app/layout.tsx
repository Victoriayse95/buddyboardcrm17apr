import React from 'react'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navbar from '@/components/Navbar'
import { AuthProvider } from '@/lib/auth'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BuddyBoard - Pet Services Marketplace',
  description: 'Find trusted pet service providers for boarding, daycare, and grooming',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <Toaster position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  )
} 