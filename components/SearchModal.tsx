'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { Search, X, FileText } from 'lucide-react'
import Link from 'next/link'
import Fuse from 'fuse.js'
import { SEARCH_INDEX, type SearchEntry } from '@/lib/searchIndex'

interface PagefindResult {
  url: string
  meta: { title: string }
  excerpt: string
}

interface Result {
  title: string
  url: string
  section: string
  excerpt?: string
}

export default function SearchModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [pagefindResults, setPagefindResults] = useState<PagefindResult[]>([])
  const [pagefind, setPagefind] = useState<any>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fuse.js instance — 模糊比對標題 + 分類
  const fuse = useMemo(
    () =>
      new Fuse<SearchEntry>(SEARCH_INDEX, {
        keys: [
          { name: 'title', weight: 0.8 },
          { name: 'section', weight: 0.2 },
        ],
        threshold: 0.4,   // 0 = 完全比對，1 = 全部符合；0.4 容許小錯字
        distance: 100,
        includeScore: true,
        useExtendedSearch: false,
        ignoreLocation: true, // 不限定匹配位置，對中文很重要
      }),
    []
  )

  // Cmd+K / Ctrl+K 開啟
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((v) => !v)
      }
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50)
    else {
      setQuery('')
      setPagefindResults([])
    }
  }, [isOpen])

  // 載入 pagefind（production build 才有）
  useEffect(() => {
    async function load() {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore — pagefind 只在 production build 後存在，無型別定義
        const pf = await import(/* webpackIgnore: true */ '/pagefind/pagefind.js')
        await pf.init()
        setPagefind(pf)
      } catch {
        // dev 環境沒有 pagefind，靜默忽略
      }
    }
    load()
  }, [])

  // pagefind 全文搜尋（有的話才跑）
  useEffect(() => {
    if (!pagefind || !query.trim()) {
      setPagefindResults([])
      return
    }
    const timer = setTimeout(async () => {
      const search = await pagefind.search(query)
      const data = await Promise.all(
        search.results.slice(0, 6).map((r: any) => r.data())
      )
      setPagefindResults(data)
    }, 200)
    return () => clearTimeout(timer)
  }, [query, pagefind])

  // 合併結果：Fuse 標題搜尋 + pagefind 全文搜尋（去重）
  const results = useMemo((): Result[] => {
    const q = query.trim()
    if (!q) return []

    const fuseHits = fuse.search(q).map((r) => ({
      title: r.item.title,
      url: r.item.url,
      section: r.item.section,
    }))

    // pagefind 結果中，過濾掉 fuse 已有的 url
    const fuseUrls = new Set(fuseHits.map((r) => r.url))
    const pfExtra = pagefindResults
      .filter((r) => !fuseUrls.has(r.url))
      .map((r) => ({
        title: r.meta.title,
        url: r.url,
        section: '',
        excerpt: r.excerpt,
      }))

    return [...fuseHits, ...pfExtra].slice(0, 8)
  }, [query, fuse, pagefindResults])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <Search className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            className="flex-1 text-sm text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
            placeholder="搜尋說明文件..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-slate-400 border border-slate-200 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <ul className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {results.map((result, i) => (
              <li key={i}>
                <Link
                  href={result.url}
                  onClick={() => setIsOpen(false)}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                >
                  <FileText className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {result.title}
                    </p>
                    {result.section && (
                      <p className="text-xs text-emerald-600 mt-0.5">
                        {result.section}
                      </p>
                    )}
                    {result.excerpt && (
                      <p
                        className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: result.excerpt }}
                      />
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {query.trim() && results.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-slate-400">
            找不到「{query}」的相關結果
          </div>
        )}

        {!query && (
          <div className="px-4 py-6 text-center text-xs text-slate-400">
            輸入關鍵字搜尋說明文件
          </div>
        )}
      </div>
    </div>
  )
}
