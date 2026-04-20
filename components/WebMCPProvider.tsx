'use client'

import { useEffect } from 'react'
import { SEARCH_INDEX } from '@/lib/searchIndex'

// WebMCP API types (navigator.modelContext — Chrome early preview)
declare global {
  interface Navigator {
    modelContext?: {
      registerTool(tool: WebMCPTool, options?: { signal?: AbortSignal }): void
    }
  }
}

interface WebMCPTool {
  name: string
  title?: string
  description: string
  inputSchema?: object
  annotations?: { readOnlyHint?: boolean }
  execute: (input: Record<string, unknown>) => Promise<unknown>
}

export default function WebMCPProvider() {
  useEffect(() => {
    if (!navigator.modelContext) return

    const controller = new AbortController()
    const { signal } = controller

    // Tool 1: list all documentation pages
    navigator.modelContext.registerTool(
      {
        name: 'list_pages',
        title: 'List Documentation Pages',
        description:
          'Returns all available DietMate documentation pages with their titles, URLs, and sections.',
        inputSchema: { type: 'object', properties: {} },
        annotations: { readOnlyHint: true },
        execute: async () => SEARCH_INDEX,
      },
      { signal }
    )

    // Tool 2: search documentation by keyword
    navigator.modelContext.registerTool(
      {
        name: 'search_docs',
        title: 'Search Documentation',
        description:
          'Searches DietMate documentation pages by keyword. Returns matching pages with title, URL, and section.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search keyword or phrase',
            },
          },
          required: ['query'],
        },
        annotations: { readOnlyHint: true },
        execute: async (input) => {
          const q = String(input.query ?? '').toLowerCase()
          if (!q) return SEARCH_INDEX
          return SEARCH_INDEX.filter(
            (entry) =>
              entry.title.toLowerCase().includes(q) ||
              entry.section.toLowerCase().includes(q)
          )
        },
      },
      { signal }
    )

    // Tool 3: navigate to a documentation page
    navigator.modelContext.registerTool(
      {
        name: 'navigate_to_page',
        title: 'Navigate to Page',
        description:
          'Navigates the browser to a DietMate documentation page by its URL path (e.g. "/dashboard/").',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL path of the documentation page, e.g. "/dashboard/"',
            },
          },
          required: ['url'],
        },
        execute: async (input) => {
          const url = String(input.url ?? '/')
          window.location.href = url
          return { navigated: true, url }
        },
      },
      { signal }
    )

    return () => controller.abort()
  }, [])

  return null
}
