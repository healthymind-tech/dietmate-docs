import { useMDXComponents as nextraUseMDXComponents } from 'nextra/mdx-components'
import CopyButton from './components/CopyButton'
import { ChevronRight } from 'lucide-react'
import type { ComponentPropsWithoutRef } from 'react'

function Pre({ children, ...props }: ComponentPropsWithoutRef<'pre'>) {
  return (
    <div className="relative group">
      <pre {...props}>{children}</pre>
      <CopyButton content={{ children }} />
    </div>
  )
}

function Details({ children, ...props }: ComponentPropsWithoutRef<'details'>) {
  return (
    <details
      className="group border border-slate-200 rounded-lg mb-2 overflow-hidden not-prose"
      {...props}
    >
      {children}
    </details>
  )
}

function Summary({ children, ...props }: ComponentPropsWithoutRef<'summary'>) {
  return (
    <summary
      className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer font-medium text-slate-800 hover:bg-slate-50 select-none [&::-webkit-details-marker]:hidden list-none"
      {...props}
    >
      <span className="text-sm leading-snug">{children}</span>
      <ChevronRight className="h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 group-open:rotate-90" />
    </summary>
  )
}

export function useMDXComponents(components = {}) {
  return nextraUseMDXComponents({
    pre: Pre,
    details: Details,
    summary: Summary,
    ...components,
  })
}
