/**
 * Cloudflare Worker entry point for dietmate-docs.
 *
 * - POST /api/feedback  → writes reaction to D1
 * - Everything else      → served from static assets
 */

const VALID_REACTIONS = new Set(['happy', 'neutral', 'sad'])

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
    return env.ASSETS.fetch(request)
  },
}
