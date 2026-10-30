'use client'
import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'

export default function LocalClock({ label }: { label: string }) {
    const locale = useLocale()
    const [now, setNow] = useState<Date | null>(null)

    useEffect(() => {
        setNow(new Date())
        const id = setInterval(() => setNow(new Date()), 30_000)
        return () => clearInterval(id)
    }, [])

    const time = now
        ? new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Porto-Novo' }).format(now)
        : '--:--'

    return (
        <p className="text-sm text-muted">
            {label}: <span className="font-display text-lg font-bold text-ink tabular-nums">{time}</span>
        </p>
    )
}