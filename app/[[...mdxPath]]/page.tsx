import { generateStaticParamsFor, importPage } from 'nextra/pages'

export const generateStaticParams = generateStaticParamsFor('mdxPath')

export async function generateMetadata(props: {
  params: Promise<{ mdxPath?: string[] }>
}) {
  const params = await props.params
  const { metadata } = await importPage(params.mdxPath)
  return metadata
}

export default async function Page(props: {
  params: Promise<{ mdxPath?: string[] }>
}) {
  const params = await props.params
  const result = await importPage(params.mdxPath)
  const { default: MDXContent } = result
  return (
    <article className="max-w-3xl mx-auto px-6 py-10">
      <MDXContent {...props} params={params} />
    </article>
  )
}
