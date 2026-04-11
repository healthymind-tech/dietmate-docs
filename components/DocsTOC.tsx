'use client'

import { useEffect, useState } from 'react'
import type { ReactElement, JSXElementConstructor } from 'react'

interface TocItem {
  id: string
  value: string | ReactElement<unknown, string | JSXElementConstructor<any>>
  depth: number
}

interface DocsTOCProps {
  toc: TocItem[]
}

export default function DocsTOC({ toc }: DocsTOCProps) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const headings = toc.map((item) => document.getElementById(item.id)).filter(Boolean)
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
            break
          }
        }
      },
      { rootMargin: '0px 0px -80% 0px' }
    )

    headings.forEach((el) => observer.observe(el!))
    return () => observer.disconnect()
  }, [toc])

  if (toc.length === 0) return null

  return (
    <nav className="w-56 flex-shrink-0 hidden xl:block">
      <div className="sticky top-8">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">本頁章節</p>
        <ul className="space-y-1">
          {toc.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`block text-xs leading-relaxed py-0.5 transition-colors ${
                  item.depth === 3 ? 'pl-3' : ''
                } ${
                  activeId === item.id
                    ? 'text-emerald-600 font-medium'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {typeof item.value === 'string' ? item.value : item.value}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
