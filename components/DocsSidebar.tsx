'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu as MenuIcon, X } from 'lucide-react'

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
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 pt-4">
        {categories.map((cat) => (
          <div key={cat.title} className="mb-4">
            <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
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
                  <span className={`text-[15px] leading-snug ${isActive ? 'font-semibold' : 'font-medium'}`}>
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
      {/* Mobile burger — only shown on mobile, topbar handles desktop */}
      <button
        className="lg:hidden fixed top-3 right-4 z-50 p-2 text-slate-500 hover:bg-slate-100 rounded-lg bg-white border border-slate-200"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 ease-in-out border-r border-slate-200 bg-white flex-shrink-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {sidebarContent}
      </aside>
    </>
  )
}
