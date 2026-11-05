import Exa from 'exa-js'

const exa = new Exa(process.env.EXA_API_KEY!)

export async function findOAuthDocs(appName: string, domain?: string): Promise<{
  officialDocsUrl: string | null
  officialDocsContent: string | null
  communityResults: Array<{ url: string; title: string; text: string }>
}> {
  const searchQuery = domain
    ? `${appName} OAuth 2.0 developer app registration documentation site:${domain}`
    : `${appName} OAuth 2.0 developer app setup registration documentation`

  // Search for official docs
  const officialSearch = await exa.searchAndContents(searchQuery, {
    numResults: 3,
    text: { maxCharacters: 8000 },
    highlights: { numSentences: 5 },
  })

  const officialResult = officialSearch.results[0] ?? null
  const officialDocsUrl = officialResult?.url ?? null
  const officialDocsContent = officialResult?.text ?? null

  // Search for community experiences in parallel
  const communitySearch = await exa.searchAndContents(
    `${appName} OAuth developer experience setup approval review wait time`,
    {
      numResults: 5,
      text: { maxCharacters: 3000 },
      includeDomains: ['reddit.com', 'stackoverflow.com', 'github.com', 'dev.to', 'medium.com', 'hashnode.com'],
    }
  )

  const communityResults = communitySearch.results.map((r) => ({
    url: r.url,
    title: r.title ?? '',
    text: r.text ?? '',
  }))

  return { officialDocsUrl, officialDocsContent, communityResults }
}
