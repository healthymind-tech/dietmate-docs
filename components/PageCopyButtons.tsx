'use client'

import { useState } from 'react'
import { Check, FileText, FileCode2 } from 'lucide-react'

type CopiedState = 'md' | 'txt' | null

function toPlainText(md: string): string {
  return md
    .replace(/^---[\s\S]*?---\n?/, '')       // remove frontmatter
    .replace(/^#{1,6}\s+/gm, '')             // headings
    .replace(/\*\*(.+?)\*\*/g, '$1')         // bold
    .replace(/\*(.+?)\*/g, '$1')             // italic
    .replace(/`{3}[\s\S]*?`{3}/g, '')        // code blocks
    .replace(/`(.+?)`/g, '$1')              // inline code
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')     // links
    .replace(/^[-*+]\s+/gm, '• ')           // unordered list
    .replace(/^\d+\.\s+/gm, (m) => m)       // ordered list (keep as-is)
    .replace(/^>\s+/gm, '')                  // blockquotes
    .replace(/\n{3,}/g, '\n\n')             // collapse extra newlines
    .trim()
}

export default function PageCopyButtons({ mdxSource }: { mdxSource: string }) {
  const [copied, setCopied] = useState<CopiedState>(null)

  const handleCopy = async (format: 'md' | 'txt') => {
    const text = format === 'md' ? mdxSource : toPlainText(mdxSource)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(format)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      alert('複製失敗，請手動選取文字複製')
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleCopy('md')}
        className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-slate-200 text-xs text-slate-500 hover:text-slate-800 hover:border-slate-300 hover:bg-slate-50 transition-all"
      >
        {copied === 'md'
          ? <Check className="h-3.5 w-3.5 text-emerald-600" />
          : <FileCode2 className="h-3.5 w-3.5" />}
        {copied === 'md' ? '已複製' : 'Markdown'}
      </button>
      <button
        onClick={() => handleCopy('txt')}
        className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all"
      >
        {copied === 'txt'
          ? <Check className="h-3.5 w-3.5 text-emerald-600" />
          : <FileText className="h-3.5 w-3.5" />}
        {copied === 'txt' ? '已複製' : '純文字'}
      </button>
    </div>
  )
}
