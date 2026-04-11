'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, X, FileText } from 'lucide-react'
import Link from 'next/link'

interface PagefindResult {
  url: string
  meta: { title: string }
  excerpt: string
}

export default function SearchModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PagefindResult[]>([])
  const [pagefind, setPagefind] = useState<any>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
    else { setQuery(''); setResults([]) }
  }, [isOpen])

  // 載入 pagefind
  useEffect(() => {
    async function load() {
      try {
        const url = '/pagefind/pagefind.js'
        const pf = await import(/* webpackIgnore: true */ url)
        await pf.init()
        setPagefind(pf)
      } catch { /* dev 環境忽略 */ }
    }
    load()
  }, [])

  // 搜尋
  useEffect(() => {
    if (!pagefind || !query.trim()) { setResults([]); return }
    const timer = setTimeout(async () => {
      const search = await pagefind.search(query)
      const data = await Promise.all(search.results.slice(0, 8).map((r: any) => r.data()))
      setResults(data)
    }, 200)
    return () => clearTimeout(timer)
  }, [query, pagefind])

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
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600">
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
                    <p className="text-sm font-medium text-slate-900">{result.meta.title}</p>
                    <p
                      className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: result.excerpt }}
                    />
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
