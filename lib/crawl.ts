import FirecrawlApp from '@mendable/firecrawl-js'

function getFirecrawl() {
  const apiKey = process.env.FIRECRAWL_API_KEY || ''
  return new FirecrawlApp({ apiKey })
}

export async function crawlOAuthPage(url: string): Promise<string> {
  try {
    const firecrawl = getFirecrawl()
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
