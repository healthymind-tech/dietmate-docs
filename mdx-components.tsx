import { useMDXComponents as nextraUseMDXComponents } from 'nextra/mdx-components'
import CopyButton from './components/CopyButton'
import type { ComponentPropsWithoutRef } from 'react'

function Pre({ children, ...props }: ComponentPropsWithoutRef<'pre'>) {
  return (
    <div className="relative group">
      <pre {...props}>{children}</pre>
      <CopyButton content={{ children }} />
    </div>
  )
}

export function useMDXComponents(components = {}) {
  return nextraUseMDXComponents({
    pre: Pre,
    ...components,
  })
}
