import './globals.css'
import DocsSidebar, { type NavCategory } from '../components/DocsSidebar'
import type { ReactNode } from 'react'

export const metadata = {
  metadataBase: new URL('https://docs.dietmate.studio'),
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const metaRaw = await import('../content/_meta.json')
  const meta = metaRaw.default as Record<string, string | { type: string; title: string }>

  const categories: NavCategory[] = []
  let currentCategory: NavCategory | null = null

  for (const [key, value] of Object.entries(meta)) {
    if (typeof value === 'object' && value.type === 'separator') {
      currentCategory = { title: value.title, items: [] }
      categories.push(currentCategory)
      continue
    }
    if (key === 'index') continue
    if (typeof value === 'string') {
      if (!currentCategory) {
        currentCategory = { title: '文件', items: [] }
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
        <div className="flex h-screen overflow-hidden bg-slate-50">
          <DocsSidebar categories={categories} />
          <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
