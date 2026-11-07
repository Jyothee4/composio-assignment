import { GoogleGenerativeAI } from '@google/generative-ai'
import { OAuthGuide } from '@/types/guide'
import { findOAuthDocs } from './search'
import { crawlOAuthPage, CrawlResult } from './crawl'

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY || ''
  return new GoogleGenerativeAI(apiKey)
}

const EXTRACTION_PROMPT = `
You are an expert at analyzing OAuth developer documentation.
You will be given official documentation content and community discussions about an OAuth setup process.
Extract structured information and return a JSON object matching the schema below.

Be precise. Only include information that is actually in the sources.
Label difficulty based on these rules:
- 1 (Instant): Self-serve, live immediately, no prerequisites
- 2 (Easy): Self-serve but needs prerequisites (privacy policy, domain, etc.)
- 3 (Moderate): Has a review/approval process, days to weeks wait
- 4 (Involved): Requires business verification, compliance docs, weeks wait
- 5 (Restricted): Requires security audit, partnership agreement, or is not publicly available

Return ONLY valid JSON. No markdown. No explanation.

Schema:
{
  "oauth_exists": boolean,
  "oauth_not_found_reason": string | null,
  "difficulty": 1 | 2 | 3 | 4 | 5,
  "difficulty_label": "Instant" | "Easy" | "Moderate" | "Involved" | "Restricted",
  "difficulty_reason": string,
  "setup_time_minutes": number,
  "approval_wait_days_min": number,
  "approval_wait_days_max": number,
  "approval_wait_source": "official" | "community" | "estimated",
  "approval_required": boolean,
  "approval_type": "none" | "self-serve" | "review" | "partnership" | "audit",
  "approval_triggers": string[],
  "oauth_flow_type": "authorization_code" | "pkce" | "client_credentials" | "device" | "unknown",
  "portal_url": string,
  "prerequisites": string[],
  "steps": [
    {
      "number": number,
      "title": string,
      "description": string,
      "url": string | null,
      "requires_human": boolean,
      "human_reason": string | null
    }
  ],
  "scopes_available": [
    {
      "name": string,
      "description": string,
      "requires_review": boolean
    }
  ],
  "scopes_triggering_review": string[],
  "known_blockers": string[],
  "agent_verified": [
    {
      "action": string,
      "status": "verified" | "found" | "attempted" | "could_not_verify",
      "note": string | null
    }
  ],
  "community_insights": [
    {
      "insight": string,
      "source_url": string | null,
      "source_type": "reddit" | "github" | "stackoverflow" | "blog" | "forum"
    }
  ]
}
`

const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
].filter(Boolean) as string[]

export async function generateGuide(
  appName: string,
  domain?: string,
  onProgress?: (step: string) => void
): Promise<OAuthGuide> {
  const genAI = getGenAI()

  onProgress?.('Searching for official OAuth documentation...')

  // Step 1: Find docs via Exa
  const { officialDocsUrl, officialDocsContent, communityResults } =
    await findOAuthDocs(appName, domain)

  onProgress?.('Reading official documentation...')

  // Step 2: Deep crawl the official page if found
  let deepContent = officialDocsContent ?? ''
  let officialSources: OAuthGuide['official_sources'] = []
  let crawlResult: CrawlResult | null = null

  if (officialDocsUrl) {
    crawlResult = await crawlOAuthPage(officialDocsUrl)
    if (crawlResult.status === 'scraped' && crawlResult.markdown.length > deepContent.length) {
      deepContent = crawlResult.markdown
    }
    officialSources = [{
      title: `${appName} OAuth Documentation`,
      url: officialDocsUrl,
      type: 'official_docs',
    }]
  }

  onProgress?.('Analyzing community experiences...')

  // Step 3: Build community context
  const communityContext = communityResults
    .map((r, i) => `[Community Source ${i + 1}] ${r.url}\n${r.text}`)
    .join('\n\n---\n\n')

  onProgress?.('Extracting structured guide with AI...')

  // Step 4: Gemini extracts everything into our schema
  const prompt = `
${EXTRACTION_PROMPT}

App Name: ${appName}
${domain ? `Domain: ${domain}` : ''}
Official Docs URL Found: ${officialDocsUrl ?? 'Not found'}

=== OFFICIAL DOCUMENTATION ===
${deepContent || 'Could not retrieve official documentation.'}

=== COMMUNITY DISCUSSIONS ===
${communityContext || 'No community discussions found.'}
`

  let text = ''
  let lastError: unknown = null
  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName })
      const result = await model.generateContent(prompt)
      text = result.response.text()
      if (text) break
    } catch (err) {
      lastError = err
      console.warn(`Model ${modelName} failed, trying fallback...`, err)
    }
  }

  if (!text) {
    throw (lastError instanceof Error ? lastError : new Error('All candidate models failed or are at capacity.'))
  }

  // Parse the JSON response
  let extracted: Partial<OAuthGuide>
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    extracted = JSON.parse(cleaned)
  } catch {
    extracted = {
      oauth_exists: false,
      oauth_not_found_reason: 'Could not parse agent response',
      difficulty: 1,
      difficulty_label: 'Instant',
      difficulty_reason: 'Unknown',
      setup_time_minutes: 0,
      approval_wait_days_min: 0,
      approval_wait_days_max: 0,
      approval_wait_source: 'estimated',
      approval_required: false,
      approval_type: 'none',
      approval_triggers: [],
      oauth_flow_type: 'unknown',
      portal_url: '',
      prerequisites: [],
      steps: [],
      scopes_available: [],
      scopes_triggering_review: [],
      known_blockers: [],
      agent_verified: [],
      community_insights: [],
    }
  }

  onProgress?.('Guide ready.')

  // Build transparent system audit items
  const systemAuditLedger: OAuthGuide['agent_verified'] = []

  if (officialDocsUrl) {
    let host = ''
    try {
      host = new URL(officialDocsUrl).hostname
    } catch {
      host = officialDocsUrl
    }

    if (crawlResult?.status === 'scraped') {
      systemAuditLedger.push({
        action: 'Official documentation scrape',
        status: 'verified',
        note: `Clean markdown extracted from ${host} via Firecrawl.`,
      })
    } else if (crawlResult?.status === 'blocked_or_empty') {
      systemAuditLedger.push({
        action: 'Official documentation scrape',
        status: 'attempted',
        note: `Direct scrape on ${host} blocked (anti-bot / JS barrier). Gracefully fell back to Exa neural semantic excerpts.`,
      })
    } else if (crawlResult?.status === 'error') {
      systemAuditLedger.push({
        action: 'Official documentation scrape',
        status: 'attempted',
        note: `Direct scrape request failed (${crawlResult.detail || 'connection error'}). Gracefully fell back to Exa semantic excerpts.`,
      })
    }
  } else {
    systemAuditLedger.push({
      action: 'Official documentation search',
      status: 'could_not_verify',
      note: 'No direct official OAuth documentation URL resolved; synthesized from community signals.',
    })
  }

  const rawVerified = extracted.agent_verified ?? []
  const filteredVerified = rawVerified.filter(
    (v) =>
      !v.action.toLowerCase().includes('scrape') &&
      !v.action.toLowerCase().includes('documentation existence')
  )
  const combinedVerified = [...systemAuditLedger, ...filteredVerified]

  return {
    app_name: appName,
    app_domain: domain ?? '',
    generated_at: new Date().toISOString(),
    official_sources: officialSources,
    ...extracted,
    agent_verified: combinedVerified,
  } as OAuthGuide
}
