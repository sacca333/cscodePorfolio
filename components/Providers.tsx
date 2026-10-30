'use client'
import { useEffect } from 'react'
import { ThemeProvider } from 'next-themes'

export default function Providers({ locale, children }: { locale: string; children: React.ReactNode }) {
    useEffect(() => {
        document.documentElement.lang = locale
    }, [locale])

    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
        </ThemeProvider>
    )
}