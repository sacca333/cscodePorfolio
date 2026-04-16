export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', minHeight: '100vh' }}>
      {children}
    </div>
  )
}