'use client'

import { Search } from 'lucide-react'

export default function DocsTopbar() {
  function openSearch() {
    const e = new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true })
    document.dispatchEvent(e)
  }

  return (
    <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 py-2.5 flex items-center justify-end gap-3">
      <button
        onClick={openSearch}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-500 transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        <span>搜尋說明文件</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 ml-1 px-1.5 py-0.5 rounded text-[10px] border border-slate-300 font-mono text-slate-400 bg-white">
          ⌘K
        </kbd>
      </button>
    </div>
  )
}
