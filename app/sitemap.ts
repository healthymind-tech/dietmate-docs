import { MetadataRoute } from 'next'

export const dynamic = 'force-static'

const baseUrl = 'https://docs.dietmate.studio'

const pages = [
  '',
  '/login',
  '/dashboard',
  '/my-patients',
  '/pending-review',
  '/patient-messages',
  '/health-stats',
  '/health-goals',
  '/nutrition-targets',
  '/rich-menu',
  '/patient-groups',
  '/settings',
  '/weekly-report-export',
  '/health-data-export',
  '/changelog',
]

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.8,
  }))
}
