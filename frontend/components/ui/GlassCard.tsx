import { ReactNode } from "react"

interface GlassCardProps {
  children: ReactNode
  className?: string
}

/**
 * Reusable glass-morphism card component with cream tint
 */
export function GlassCard({ children, className = "" }: GlassCardProps) {
  return <div className={`glass-card ${className}`}>{children}</div>
}
