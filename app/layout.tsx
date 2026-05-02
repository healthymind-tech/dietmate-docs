import './globals.css'
import DocsSidebar, { type NavCategory } from '../components/DocsSidebar'
import DocsTopbar from '../components/DocsTopbar'
import SearchModal from '../components/SearchModal'
import WebMCPProvider from '../components/WebMCPProvider'
import type { ReactNode } from 'react'

export const metadata = {
  metadataBase: new URL('https://docs.dietmate.studio'),
  verification: {
    google: '3_NMi14lo74HnpzgXYaV75Xig-WpFfTqlhIQdBPxMQ0',
  },
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const metaRaw = await import('../content/_meta.json')
  const meta = metaRaw.default as Record<string, string | { type: string; title: string }>

  const categories: NavCategory[] = []
  let currentCategory: NavCategory | null = null
  let currentSection = 'docs'

  for (const [key, value] of Object.entries(meta)) {
    if (typeof value === 'object' && value.type === 'separator') {
      if (value.title === '更新日誌') currentSection = 'changelog'
      currentCategory = { title: value.title, items: [], section: currentSection }
      categories.push(currentCategory)
      continue
    }
    if (key === 'index') continue
    if (typeof value === 'string') {
      if (!currentCategory) {
        currentCategory = { title: '文件', items: [], section: currentSection }
        categories.push(currentCategory)
      }
      currentCategory.items.push({
        id: key,
        title: value,
        href: `/${key}`,
      })
    }
  }

  return (
    <html lang="zh-TW">
      <body>
        <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
          <DocsTopbar />
          <div className="flex flex-1 overflow-hidden">
            <DocsSidebar categories={categories} />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
          <SearchModal />
          <WebMCPProvider />
        </div>
      </body>
    </html>
  )
}
