'use client'

import { Search } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_TABS = [
  { label: 'DietMate 教學文件', href: '/' },
  { label: '更新日誌', href: '/changelog' },
]

export default function DocsTopbar() {
  const pathname = usePathname()

  function openSearch() {
    const e = new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true })
    document.dispatchEvent(e)
  }

  return (
    <header className="z-20 bg-white border-b border-slate-200 flex-shrink-0">
      {/* Row 1: Logo | Search (center) | spacer */}
      <div className="px-5 h-14 flex items-center gap-4">
        {/* Logo — fixed width to balance right side */}
        <Link href="/" className="flex items-center gap-3 min-w-0 w-56 flex-shrink-0">
          <img
            src="/logo.jpg"
            alt="療心智能"
            className="h-8 w-auto object-contain object-left"
          />
          <span className="text-sm font-semibold text-slate-700 hidden sm:block whitespace-nowrap">
            教學文件中心
          </span>
        </Link>

        {/* Search — centered, grows to fill middle */}
        <div className="flex-1 flex justify-center">
          <button
            onClick={openSearch}
            className="flex items-center gap-2 w-full max-w-md px-4 py-2 bg-slate-100 hover:bg-white hover:border-emerald-400 border border-slate-200 rounded-lg text-sm text-slate-400 transition-all"
          >
            <Search className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1 text-left">搜尋說明文件...</span>
            <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] border border-slate-300 font-mono text-slate-400 bg-white">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right spacer — same width as logo to keep search centered */}
        <div className="w-56 flex-shrink-0" />
      </div>

      {/* Row 2: Section tabs */}
      <nav className="px-5 flex items-end gap-1">
        {NAV_TABS.map((tab) => {
          const isActive = tab.href === '/'
            ? !NAV_TABS.filter(t => t.href !== '/').some(t => pathname.startsWith(t.href))
            : pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative px-3 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'text-emerald-600 after:absolute after:bottom-0 after:inset-x-3 after:h-0.5 after:bg-emerald-500 after:rounded-t'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
