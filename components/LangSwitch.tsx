'use client'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'

export default function LangSwitch() {
    const locale = useLocale()
    const router = useRouter()
    const pathname = usePathname()

    return (
        <div role="group" aria-label="Language" className="flex rounded-full border border-line p-0.5 text-sm">
            {(['en', 'fr'] as const).map((l) => (
                <button
                    key={l}
                    type="button"
                    lang={l}
                    aria-pressed={locale === l}
                    onClick={() => router.replace(pathname, { locale: l })}
                    className={`rounded-full px-3 py-1 font-medium ${locale === l ? 'bg-accent text-accent-ink' : 'text-muted hover:text-ink'
                        }`}
                >
                    {l.toUpperCase()}
                </button>
            ))}
        </div>
    )
}