'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Menu as MenuIcon, X } from 'lucide-react'

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
  const pathname = usePathname()

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
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        {categories.map((cat) => (
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
