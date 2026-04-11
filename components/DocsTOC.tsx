'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import type { ReactElement, JSXElementConstructor } from 'react'

function FaceHappy() {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="9" r="9" fill="currentColor" fillOpacity="0.2" />
      {/* left eye */}
      <path fillRule="evenodd" clipRule="evenodd" d="M5 8.25C4.586 8.25 4.25 7.914 4.25 7.5V6C4.25 5.586 4.586 5.25 5 5.25C5.414 5.25 5.75 5.586 5.75 6V7.5C5.75 7.914 5.414 8.25 5 8.25Z" fill="currentColor" />
      {/* right eye */}
      <path fillRule="evenodd" clipRule="evenodd" d="M13 8.25C12.586 8.25 12.25 7.914 12.25 7.5V6C12.25 5.586 12.586 5.25 13 5.25C13.414 5.25 13.75 5.586 13.75 6V7.5C13.75 7.914 13.414 8.25 13 8.25Z" fill="currentColor" />
      {/* smile */}
      <path d="M5.5 11.5C5.5 11.5 6.8 14 9 14C11.2 14 12.5 11.5 12.5 11.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}

function FaceNeutral() {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="9" r="9" fill="currentColor" fillOpacity="0.2" />
      <path fillRule="evenodd" clipRule="evenodd" d="M5 8.25C4.586 8.25 4.25 7.914 4.25 7.5V6C4.25 5.586 4.586 5.25 5 5.25C5.414 5.25 5.75 5.586 5.75 6V7.5C5.75 7.914 5.414 8.25 5 8.25ZM4.5 12C4.5 11.724 4.724 11.5 5 11.5H13C13.276 11.5 13.5 11.724 13.5 12C13.5 12.276 13.276 12.5 13 12.5H5C4.724 12.5 4.5 12.276 4.5 12ZM12.25 7.5C12.25 7.914 12.586 8.25 13 8.25C13.414 8.25 13.75 7.914 13.75 7.5V6C13.75 5.586 13.414 5.25 13 5.25C12.586 5.25 12.25 5.586 12.25 6V7.5Z" fill="currentColor" />
    </svg>
  )
}

function FaceSad() {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="9" r="9" fill="currentColor" fillOpacity="0.2" />
      {/* left eye */}
      <path fillRule="evenodd" clipRule="evenodd" d="M5 8.25C4.586 8.25 4.25 7.914 4.25 7.5V6C4.25 5.586 4.586 5.25 5 5.25C5.414 5.25 5.75 5.586 5.75 6V7.5C5.75 7.914 5.414 8.25 5 8.25Z" fill="currentColor" />
      {/* right eye */}
      <path fillRule="evenodd" clipRule="evenodd" d="M13 8.25C12.586 8.25 12.25 7.914 12.25 7.5V6C12.25 5.586 12.586 5.25 13 5.25C13.414 5.25 13.75 5.586 13.75 6V7.5C13.75 7.914 13.414 8.25 13 8.25Z" fill="currentColor" />
      {/* frown */}
      <path d="M5.5 13.5C5.5 13.5 6.8 11 9 11C11.2 11 12.5 13.5 12.5 13.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}

interface TocItem {
  id: string
  value: string | ReactElement<unknown, string | JSXElementConstructor<any>>
  depth: number
}

interface DocsTOCProps {
  toc: TocItem[]
}

const REACTIONS = [
  { key: 'happy',   Face: FaceHappy,   label: '有幫助' },
  { key: 'neutral', Face: FaceNeutral, label: '普通' },
  { key: 'sad',     Face: FaceSad,     label: '沒幫助' },
]

function FeedbackWidget() {
  const pathname = usePathname()
  const [picked, setPicked] = useState<string | null>(null)

  useEffect(() => { setPicked(null) }, [pathname])

  return (
    <div className="mt-8 pt-6 border-t border-slate-100">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
        是否對你有幫助？
      </p>
      <div className="flex gap-2">
        {REACTIONS.map(({ key, Face, label }) => (
          <button
            key={key}
            onClick={() => setPicked(key)}
            title={label}
            className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl border transition-all ${
              picked === key
                ? 'border-emerald-300 bg-emerald-50 text-emerald-600'
                : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-600'
            }`}
          >
            <Face />
            <span className="text-[10px]">{label}</span>
          </button>
        ))}
      </div>
      {picked && (
        <p className="mt-3 text-xs text-emerald-600 font-medium">
          感謝你的回饋！
        </p>
      )}
    </div>
  )
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

        <FeedbackWidget />
      </div>
    </nav>
  )
}
