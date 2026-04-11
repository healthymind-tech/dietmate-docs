import { useMDXComponents as nextraUseMDXComponents } from 'nextra/mdx-components'

export function useMDXComponents(components = {}) {
  return nextraUseMDXComponents(components)
}
