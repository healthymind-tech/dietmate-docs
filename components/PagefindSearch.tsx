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
        const url = '/pagefind/pagefind.js'
        const pf = await import(/* webpackIgnore: true */ url)
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
