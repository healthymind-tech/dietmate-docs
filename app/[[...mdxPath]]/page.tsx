import { generateStaticParamsFor, importPage } from 'nextra/pages'
import DocsTOC from '../../components/DocsTOC'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export const generateStaticParams = generateStaticParamsFor('mdxPath')

export async function generateMetadata(props: {
  params: Promise<{ mdxPath?: string[] }>
}) {
  const params = await props.params
  const { metadata } = await importPage(params.mdxPath)
  return metadata
}

// Build flat ordered list of pages with their category from _meta.json
function buildPageList(meta: Record<string, string | { type: string; title: string }>) {
  const pages: { id: string; title: string; category: string }[] = []
  let currentCategory = ''
  for (const [key, value] of Object.entries(meta)) {
    if (typeof value === 'object' && value.type === 'separator') {
      currentCategory = value.title
      continue
    }
    if (key === 'index') continue
    if (typeof value === 'string') {
      pages.push({ id: key, title: value, category: currentCategory })
    }
  }
  return pages
}

export default async function Page(props: {
  params: Promise<{ mdxPath?: string[] }>
}) {
  const params = await props.params
  const result = await importPage(params.mdxPath)
  const { default: MDXContent, toc, metadata } = result

  const metaRaw = await import('../../content/_meta.json')
  const meta = metaRaw.default as Record<string, string | { type: string; title: string }>
  const pages = buildPageList(meta)

  const slug = params.mdxPath?.[0] ?? 'index'
  const currentIdx = pages.findIndex((p) => p.id === slug)
  const current = pages[currentIdx]
  const prev = currentIdx > 0 ? pages[currentIdx - 1] : null
  const next = currentIdx < pages.length - 1 ? pages[currentIdx + 1] : null

  return (
    <div className="flex flex-col h-full">
      {/* Sticky breadcrumb */}
      {current && (
        <div className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-md px-8 py-3 border-b border-slate-200/50">
          <div className="max-w-3xl mx-auto flex items-center gap-1.5 text-xs text-slate-500">
            <Link href="/" className="hover:text-emerald-600 transition-colors">說明中心</Link>
            <ChevronRight className="h-3 w-3 text-slate-300" />
            <span className="text-slate-400">{current.category}</span>
            <ChevronRight className="h-3 w-3 text-slate-300" />
            <span className="text-slate-900 font-medium">{current.title}</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex gap-8 px-8 py-10 flex-1 justify-center">
        <div className="min-w-0 w-full max-w-3xl">
          {/* Page header */}
          {current && (
            <header className="mb-8">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                {current.category}
              </p>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2">
                {(metadata as any)?.title ?? current.title}
              </h1>
              {(metadata as any)?.description && (
                <p className="text-base text-slate-600 leading-relaxed">
                  {(metadata as any).description}
                </p>
              )}
            </header>
          )}

          {/* MDX content */}
          <article className="prose prose-slate prose-headings:font-bold prose-h2:text-lg prose-h2:flex prose-h2:items-center prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline prose-code:text-emerald-700 prose-code:bg-emerald-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none max-w-none">
            <MDXContent {...props} params={params} />
          </article>

          {/* Prev / Next */}
          {(prev || next) && (
            <nav className="flex items-center justify-between pt-8 mt-8 border-t border-slate-200">
              {prev ? (
                <Link
                  href={`/${prev.id}`}
                  className="group flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 transition-colors"
                >
                  <ChevronRight className="h-4 w-4 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
                  <span>{prev.title}</span>
                </Link>
              ) : <div />}
              {next ? (
                <Link
                  href={`/${next.id}`}
                  className="group flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 transition-colors"
                >
                  <span>{next.title}</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ) : <div />}
            </nav>
          )}
        </div>

        <DocsTOC toc={toc} />
      </div>
    </div>
  )
}
