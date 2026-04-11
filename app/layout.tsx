import { Footer, LastUpdated, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import type { ReactNode } from 'react'

export const metadata = {
  metadataBase: new URL('https://docs.dietmate.studio'),
}

const navbar = (
  <Navbar
    logo={
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontWeight: 700, fontSize: '1rem' }}>DietMate 說明中心</span>
      </div>
    }
  />
)

const footer = <Footer>© {new Date().getFullYear()} DietMate. All rights reserved.</Footer>

export default async function RootLayout({ children }: { children: ReactNode }) {
  const pageMap = await getPageMap()

  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          footer={footer}
          pageMap={pageMap}
          docsRepositoryBase="https://github.com/healthymind-tech/dietmate-docs/tree/main"
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
