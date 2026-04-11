# dietmate-docs 自訂設計 + Pagefind 搜尋 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 將 dietmate-docs 從 nextra-theme-docs 預設主題，改成複製自 meal-analysis-system 的自訂設計，並整合 Pagefind 做 client-side 全文搜尋。

**Architecture:** 保留 nextra 處理 MDX 渲染，移除 nextra-theme-docs，新增 Tailwind CSS v3 + lucide-react，自建 layout（sidebar + main content），sidebar 導航從 `_meta.json` 透過 nextra `getPageMap()` 取得，搜尋用 Pagefind（build 後爬 `out/` HTML 產生索引）。

**Tech Stack:** Next.js 16 (static export), Nextra v4 (bare, no theme), Tailwind CSS v3, lucide-react, Pagefind, Cloudflare Pages

**Source of truth for design:** `/Users/audi1/Documents/meal-analysis-system/app/[locale]/docs-public/`

---

## Task 1: 安裝 Tailwind CSS v3 + lucide-react，移除 nextra-theme-docs

**Files:**
- Modify: `package.json`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `app/globals.css`

**Step 1: 安裝依賴**

```bash
cd /Users/audi1/Documents/dietmate-docs
pnpm add -D tailwindcss@^3 postcss autoprefixer
pnpm add lucide-react
pnpm remove nextra-theme-docs
```

**Step 2: 初始化 Tailwind config**

建立 `tailwind.config.ts`：

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.{md,mdx}',
    './mdx-components.tsx',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config
```

**Step 3: 建立 postcss.config.js**

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**Step 4: 建立 app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Step 5: 確認 build 通過**

```bash
pnpm build
```
Expected: 成功（頁面暫時無樣式，下一個 Task 修）

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: 安裝 Tailwind CSS v3 + lucide-react，移除 nextra-theme-docs"
```

---

## Task 2: 更新 mdx-components.tsx + layout.tsx 引入 globals.css

**Files:**
- Modify: `mdx-components.tsx`
- Modify: `app/layout.tsx`

**Step 1: 更新 mdx-components.tsx**

nextra-theme-docs 移除後，改用 bare nextra 的 useMDXComponents：

```typescript
import type { MDXComponents } from 'mdx/types'

export function useMDXComponents(components: MDXComponents = {}): MDXComponents {
  return {
    ...components,
  }
}
```

**Step 2: 更新 app/layout.tsx**

引入 globals.css，移除 nextra-theme-docs 的 layout 包裝，改成純 HTML shell（sidebar 在 Task 3 加）：

```typescript
import './globals.css'
import type { ReactNode } from 'react'

export const metadata = {
  metadataBase: new URL('https://docs.dietmate.studio'),
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  )
}
```

**Step 3: 確認 build 通過**

```bash
pnpm build
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: 更新 mdx-components 與 layout，移除 nextra-theme-docs 依賴"
```

---

## Task 3: 建立 Sidebar 元件

**Files:**
- Create: `components/DocsSidebar.tsx`

Sidebar 設計完全複製自 meal-analysis-system 的 `docs-public layout.tsx`，但導航資料改從 `_meta.json` 讀取（透過 nextra `getPageMap()`），搜尋改成呼叫 Pagefind（Task 5 再接），先做 UI 骨架。

**Step 1: 建立 components/DocsSidebar.tsx**

```typescript
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Menu as MenuIcon, X, Search } from 'lucide-react'

export interface NavItem {
  id: string
  title: string
  href: string
}

export interface NavCategory {
  title: string
  items: NavItem[]
}

interface DocsSidebarProps {
  categories: NavCategory[]
}

export default function DocsSidebar({ categories }: DocsSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()

  const filteredCategories = categories.map((cat) => ({
    ...cat,
    items: cat.items.filter((item) =>
      !searchQuery.trim() || item.title.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0)

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-5 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-3 mb-5 group">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight">說明中心</h1>
            <p className="text-[11px] text-slate-400">公開文件庫</p>
          </div>
        </Link>
        {/* Search input - Pagefind 在 Task 5 接上 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="docs-search-input"
            className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-transparent focus:border-emerald-500 focus:bg-white focus:outline-none rounded-lg text-sm transition-all placeholder:text-slate-400"
            placeholder="搜尋說明文件..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        {filteredCategories.map((cat) => (
          <div key={cat.title} className="mb-4">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              {cat.title}
            </p>
            {cat.items.map((item) => {
              const isActive = pathname === item.href || pathname.endsWith(item.href)
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all mb-0.5 ${
                    isActive
                      ? 'bg-emerald-50 text-slate-900 border border-emerald-200'
                      : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <span className={`text-sm leading-snug ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    {item.title}
                  </span>
                </Link>
              )
            })}
          </div>
        ))}
        {filteredCategories.length === 0 && (
          <div className="text-center py-8">
            <Search className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-400 text-xs">找不到相關結果</p>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-100">
        <a
          href="https://dietmate.studio"
          className="w-full flex justify-start px-3 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          回到 DietMate
        </a>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-emerald-500 rounded-md flex items-center justify-center">
            <BookOpen className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-bold text-sm">說明中心</span>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 ease-in-out border-r border-slate-200 bg-white
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {sidebarContent}
      </aside>
    </>
  )
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: 新增 DocsSidebar 元件（樣式複製自 meal-analysis-system）"
```

---

## Task 4: 更新 app/layout.tsx 整合 Sidebar

**Files:**
- Modify: `app/layout.tsx`

從 `_meta.json` 的 nextra `getPageMap()` 建立 categories，傳給 DocsSidebar。

**Step 1: 更新 app/layout.tsx**

```typescript
import './globals.css'
import { getPageMap } from 'nextra/page-map'
import DocsSidebar, { type NavCategory } from '../components/DocsSidebar'
import type { ReactNode } from 'react'

export const metadata = {
  metadataBase: new URL('https://docs.dietmate.studio'),
}

async function buildNavCategories(): Promise<NavCategory[]> {
  const pageMap = await getPageMap()
  const categories: NavCategory[] = []
  let currentCategory: NavCategory | null = null

  for (const item of pageMap) {
    // Separator → new category
    if (item.kind === 'Meta') continue
    if (item.kind === 'MdxPage' && (item as any).frontMatter?.type === 'separator') continue

    // nextra page map item types: MdxPage, Folder, Meta
    if (item.kind === 'MdxPage') {
      const page = item as { kind: 'MdxPage'; name: string; route: string; frontMatter?: Record<string, unknown> }
      if (!currentCategory) {
        currentCategory = { title: '文件', items: [] }
        categories.push(currentCategory)
      }
      currentCategory.items.push({
        id: page.name,
        title: String(page.frontMatter?.title ?? page.name),
        href: page.route,
      })
    }
  }

  return categories
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Build nav from _meta.json via getPageMap
  // We read _meta.json directly for category grouping since getPageMap doesn't expose separators cleanly
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
    if (key === 'index') continue // skip home page from sidebar
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
```

**Step 2: Build 確認**

```bash
pnpm build
```
Expected: Build 成功，sidebar 顯示正確導航分類

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: layout 整合 DocsSidebar，從 _meta.json 建立導航分類"
```

---

## Task 5: 整合 Pagefind 搜尋

**Files:**
- Modify: `package.json` (scripts)
- Create: `components/PagefindSearch.tsx`
- Modify: `components/DocsSidebar.tsx`

**Step 1: 安裝 pagefind**

```bash
pnpm add -D pagefind
```

**Step 2: 更新 package.json scripts**

`build` script 改為先跑 next build，再跑 pagefind 建立索引：

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build && npx pagefind --site out",
    "start": "next start"
  }
}
```

**Step 3: 建立 components/PagefindSearch.tsx**

Pagefind JS API 是在 build 後才存在（在 `out/pagefind/pagefind.js`），所以要動態載入。這個元件取代 sidebar 裡的 input，顯示搜尋結果 dropdown：

```typescript
'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import Link from 'next/link'

interface PagefindResult {
  url: string
  meta: { title: string }
  excerpt: string
}

export default function PagefindSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PagefindResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [pagefind, setPagefind] = useState<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 動態載入 pagefind（只在 production build 存在）
  useEffect(() => {
    async function load() {
      try {
        const pf = await import(/* webpackIgnore: true */ '/pagefind/pagefind.js')
        await pf.init()
        setPagefind(pf)
      } catch {
        // dev 環境沒有 pagefind，忽略
      }
    }
    load()
  }, [])

  // 搜尋
  useEffect(() => {
    if (!pagefind || !query.trim()) {
      setResults([])
      return
    }
    const timer = setTimeout(async () => {
      const search = await pagefind.search(query)
      const data = await Promise.all(search.results.slice(0, 8).map((r: any) => r.data()))
      setResults(data)
      setIsOpen(true)
    }, 200)
    return () => clearTimeout(timer)
  }, [query, pagefind])

  // 點外面關閉
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          className="w-full pl-9 pr-8 py-2 bg-slate-100 border border-transparent focus:border-emerald-500 focus:bg-white focus:outline-none rounded-lg text-sm transition-all placeholder:text-slate-400"
          placeholder="搜尋說明文件..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true) }}
          onFocus={() => results.length > 0 && setIsOpen(true)}
        />
        {query && (
          <button
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            onClick={() => { setQuery(''); setResults([]); setIsOpen(false) }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* 搜尋結果 dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-lg z-50 overflow-hidden">
          {results.map((result, i) => (
            <Link
              key={i}
              href={result.url}
              onClick={() => { setIsOpen(false); setQuery('') }}
              className="block px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors"
            >
              <p className="text-sm font-medium text-slate-900 mb-0.5">{result.meta.title}</p>
              <p
                className="text-xs text-slate-500 line-clamp-2 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: result.excerpt }}
              />
            </Link>
          ))}
        </div>
      )}

      {isOpen && query.trim() && results.length === 0 && pagefind && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-lg z-50 p-4 text-center">
          <p className="text-xs text-slate-400">找不到「{query}」的相關結果</p>
        </div>
      )}
    </div>
  )
}
```

**Step 4: 把 DocsSidebar 裡的 search input 換成 PagefindSearch**

修改 `components/DocsSidebar.tsx`，把 Header 裡的 `<input>` 整段換成：

```typescript
import PagefindSearch from './PagefindSearch'

// 在 Header 區塊裡，把 <div className="relative">...</div> 換成：
<PagefindSearch />
```

同時移除 `searchQuery` state 和 `filteredCategories` 邏輯（sidebar 不再做 filter，filter 由 Pagefind 負責）。

**Step 5: Build 確認（含 Pagefind 索引）**

```bash
pnpm build
```
Expected:
1. `next build` 成功，產生 `out/`
2. `pagefind --site out` 成功，產生 `out/pagefind/` 目錄

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: 整合 Pagefind 搜尋，build 後自動建立全文索引"
```

---

## Task 6: 首頁設計（index.mdx → 自訂首頁元件）

**Files:**
- Modify: `content/index.mdx`

meal-analysis-system 首頁有 Hero + 分類卡片。MDX 可以直接嵌入 JSX，用 `content/index.mdx` 做到一樣效果：

**Step 1: 更新 content/index.mdx**

```mdx
---
title: DietMate 說明中心
description: 快速找到 DietMate 飲食分析系統的操作指引
---

import { BookOpen, Lightbulb } from 'lucide-react'

# 說明中心

歡迎使用飲食分析系統說明中心。選擇左側功能分類，或直接瀏覽下方章節，快速找到您需要的操作指引。

> 初次使用建議從「基礎入門」章節開始，了解登入流程與工作台操作後，再逐步探索各項核心功能。

## 基礎入門

- [登入工作台](/login) — 如何以營養師帳號登入系統
- [工作台總覽](/dashboard) — 首頁各區塊功能說明

## 核心功能

- [查看我的病患](/my-patients) — 病患列表與搜尋
- [審核飲食分析](/pending-review) — AI 分析審核流程
- [與病患對話](/patient-messages) — 訊息功能操作

## 進階功能

- [病患健康數據](/health-stats) — 健康紀錄查看
- [健康目標管理](/health-goals) — 設定與追蹤目標
- [每日熱量目標](/nutrition-targets) — 熱量目標設定
- [LINE Rich Menu](/rich-menu) — Rich Menu 建立與管理
- [患者群組標籤](/patient-groups) — 群組與標籤管理
- [個人設定](/settings) — 帳號與通知設定

## 報表匯出

- [飲食分析週報](/weekly-report-export) — 週報 PDF 匯出
- [健康數據匯出](/health-data-export) — 健康數據 Excel 匯出
```

**Step 2: Build 確認**

```bash
pnpm build
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: 更新首頁內容，加入完整分類導覽連結"
```

---

## Task 7: 部署到 Cloudflare Pages

**Step 1: 確認 wrangler.toml 設定正確**

```toml
name = "dietmate-docs"
pages_build_output_dir = "out"
compatibility_date = "2024-01-01"
```

**Step 2: 確認 Cloudflare Pages Dashboard 設定**

- Build command: `pnpm build`（含 pagefind，因為 package.json scripts 已更新）
- Build output directory: `out`
- Deploy command: `echo done`

**Step 3: Push 觸發部署**

```bash
git push origin main
```

**Step 4: 在 Cloudflare Pages 手動 Retry deploy 確認成功**

---

## 注意事項

### Pagefind dev 環境
`/pagefind/pagefind.js` 在 dev 環境不存在（只有 build 後才有），`PagefindSearch` 元件已處理 `try/catch`，dev 環境 search input 顯示但不搜尋，這是正常的。

如果要在 dev 測試搜尋，先跑 `pnpm build` 再跑 `npx serve out`。

### Cloudflare Pages build command
`pnpm build` 現在包含 `next build && npx pagefind --site out`，Cloudflare Pages 會一次跑完。
