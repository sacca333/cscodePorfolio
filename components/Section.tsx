export default function Section({
    id,
    title,
    children,
    tinted = false,
}: {
    id: string
    title: string
    children: React.ReactNode
    tinted?: boolean
}) {
    return (
        <section id={id} className={tinted ? 'border-y border-line bg-card' : ''}>
            <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
                <h2 className="mb-10 font-display text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
                {children}
            </div>
        </section>
    )
}