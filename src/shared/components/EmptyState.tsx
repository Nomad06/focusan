import React from 'react'

interface Props {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  compact?: boolean
}

export const EmptyState: React.FC<Props> = ({ icon, title, description, action, compact }) => (
  <div
    className={`flex flex-col items-center justify-center text-center ${compact ? 'py-8' : 'py-16'}`}
  >
    {icon && <div className="mb-4 text-sumi-gray/30">{icon}</div>}
    <div className="font-serif text-base text-sumi-black/80 mb-1">{title}</div>
    {description && (
      <div className="text-sm text-sumi-gray/70 max-w-xs leading-relaxed">{description}</div>
    )}
    {action && <div className="mt-5">{action}</div>}
  </div>
)
