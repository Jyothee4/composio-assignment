import FirecrawlApp from '@mendable/firecrawl-js'

export interface CrawlResult {
  markdown: string
  status: 'scraped' | 'blocked_or_empty' | 'error'
  detail?: string
}

function getFirecrawl() {
  const apiKey = process.env.FIRECRAWL_API_KEY || ''
  return new FirecrawlApp({ apiKey })
}

export async function crawlOAuthPage(url: string): Promise<CrawlResult> {
  if (!process.env.FIRECRAWL_API_KEY) {
    return {
      markdown: '',
      status: 'error',
      detail: 'FIRECRAWL_API_KEY not configured',
    }
  }

  try {
    const firecrawl = getFirecrawl()
    const result = await firecrawl.scrapeUrl(url, {
      formats: ['markdown'],
      onlyMainContent: true,
    })

    if (result.success) {
      if (result.markdown && result.markdown.trim().length > 100) {
        return {
          markdown: result.markdown,
          status: 'scraped',
        }
      }
      return {
        markdown: result.markdown || '',
        status: 'blocked_or_empty',
        detail: 'Page body was empty or truncated by anti-bot challenge',
      }
    }

    return {
      markdown: '',
      status: 'blocked_or_empty',
      detail: result.error || 'Anti-bot challenge or scrape error encountered',
    }
  } catch (err) {
    return {
      markdown: '',
      status: 'error',
      detail: err instanceof Error ? err.message : 'Scrape request failed',
    }
  }
}
