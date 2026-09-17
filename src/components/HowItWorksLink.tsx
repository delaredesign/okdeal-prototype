export function HowItWorksLink({ children, className }: { children: string; className?: string }) {
  return <button type="button" className={`section-link ${className ?? ''}`} onClick={() => {
    const section = document.getElementById('how-it-works')
    section?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    section?.focus({ preventScroll: true })
  }}>{children}</button>
}
