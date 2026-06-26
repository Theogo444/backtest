// ============================================================================
//  Tooltip.jsx — infobulle explicative (icône « ? ») pour les métriques
// ============================================================================

import { useState, useId } from 'react'
import { HelpCircle } from 'lucide-react'

export default function Tooltip({ text, children, className = '' }) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <span className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        aria-label="Aide"
        aria-describedby={id}
        className="inline-flex text-navy-400 transition-colors hover:text-navy-700 dark:hover:text-navy-200"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(e) => {
          e.preventDefault()
          setOpen((v) => !v)
        }}
      >
        {children || <HelpCircle size={15} strokeWidth={2.2} />}
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-lg bg-navy-900 px-3 py-2 text-xs font-normal normal-case leading-snug text-white shadow-lg ring-1 ring-navy-700"
        >
          {text}
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-navy-900" />
        </span>
      )}
    </span>
  )
}
