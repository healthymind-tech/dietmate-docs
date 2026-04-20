/**
 * Cloudflare Worker entry point for dietmate-docs.
 *
 * - POST /api/feedback  → writes reaction to D1
 * - Everything else      → served from static assets
 *
 * Agent-readiness features:
 * - Accept: text/markdown  → returns markdown conversion of HTML pages
 * - Link headers on homepage for RFC 8288 agent discovery
 * - /.well-known/api-catalog served with application/linkset+json
 */

const VALID_REACTIONS = new Set(['happy', 'neutral', 'sad'])

// ── HTML → Markdown conversion ────────────────────────────────────────────────

function stripTags(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim()
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

function htmlToMarkdown(html) {
  // Prefer <main> or <article> to skip nav/sidebar noise
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
  const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
  let content = (mainMatch || articleMatch)?.[1] ?? html

  return content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, t) => `# ${stripTags(t)}\n\n`)
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => `## ${stripTags(t)}\n\n`)
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => `### ${stripTags(t)}\n\n`)
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, t) => `#### ${stripTags(t)}\n\n`)
    .replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, (_, t) => `##### ${stripTags(t)}\n\n`)
    .replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, (_, t) => `###### ${stripTags(t)}\n\n`)
    .replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => `[${stripTags(text)}](${href})`)
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*')
    .replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (_, code) => `\`\`\`\n${decodeEntities(code)}\n\`\`\`\n\n`)
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, code) => `\`${decodeEntities(code)}\``)
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => `- ${stripTags(t).trim()}\n`)
    .replace(/<\/[uo]l>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n')
    .replace(/<hr\s*\/?>/gi, '\n---\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// Rough token estimate: ~4 chars per token
function estimateTokens(text) {
  return Math.ceil(text.length / 4)
}

// ── Worker ────────────────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    // ── Feedback API ─────────────────────────────────────────
    if (url.pathname === '/api/feedback') {
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204 })
      }
      if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 })
      }

      let page, reaction
      try {
        ;({ page, reaction } = await request.json())
      } catch {
        return new Response('Invalid JSON', { status: 400 })
      }

      if (typeof page !== 'string' || !VALID_REACTIONS.has(reaction)) {
        return new Response('Bad Request', { status: 400 })
      }

      await env.DB.prepare(
        'INSERT INTO feedback (page, reaction) VALUES (?, ?)'
      )
        .bind(page.slice(0, 255), reaction)
        .run()

      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // ── Static assets fallthrough ─────────────────────────────
    const response = await env.ASSETS.fetch(request)

    // Fix Content-Type for /.well-known/api-catalog (must be application/linkset+json)
    if (url.pathname === '/.well-known/api-catalog' && response.ok) {
      const headers = new Headers(response.headers)
      headers.set('Content-Type', 'application/linkset+json')
      return new Response(response.body, { status: response.status, headers })
    }

    const accept = request.headers.get('Accept') ?? ''
    const wantsMarkdown = accept.includes('text/markdown')
    const isHtml = (response.headers.get('Content-Type') ?? '').includes('text/html')
    const isHomepage = url.pathname === '/' || url.pathname === '/index.html'

    // ── Markdown content negotiation (RFC-style Accept: text/markdown) ────────
    if (wantsMarkdown && isHtml && response.ok) {
      const html = await response.text()
      const markdown = htmlToMarkdown(html)
      const tokens = estimateTokens(markdown)
      return new Response(markdown, {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'x-markdown-tokens': String(tokens),
        },
      })
    }

    // ── Link headers on homepage for agent discovery (RFC 8288) ──────────────
    if (isHomepage && response.ok) {
      const headers = new Headers(response.headers)
      headers.append('Link', '</sitemap.xml>; rel="sitemap"')
      headers.append('Link', '<https://docs.dietmate.studio/>; rel="service-doc"')
      headers.append('Link', '</.well-known/api-catalog>; rel="api-catalog"')
      return new Response(response.body, { status: response.status, headers })
    }

    return response
  },
}
