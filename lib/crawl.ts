import FirecrawlApp from '@mendable/firecrawl-js'

const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY! })

export async function crawlOAuthPage(url: string): Promise<string> {
  try {
    const result = await firecrawl.scrapeUrl(url, {
      formats: ['markdown'],
      onlyMainContent: true,
    })

    if (result.success && result.markdown) {
      return result.markdown
    }
    return ''
  } catch {
    return ''
  }
}
