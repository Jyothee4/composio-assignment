# OAuthGuide

Every developer building an AI agent hits the same wall. Getting an LLM to generate good output takes an afternoon. Getting that agent connected to a user's Slack, Google Drive, or Salesforce account can derail an entire launch by four weeks.

The core issue isn't OAuth itself—it's the complete lack of visibility into provider friction. A developer usually has no idea whether registering an app will take ten minutes of self-serve clicking or a month of back-and-forth emails, security audits, and video screencasts.

OAuthGuide is built to solve that blind spot. You search any app, and within 25 seconds you get a clear, practical roadmap: difficulty tier, real setup time, expected approval wait, step-by-step instructions, known blockers, and exactly where a human has to step in.

---

## The Strategic Problem: Managed Auth vs. Custom Provider Apps

In the AI agent ecosystem (and specifically in platforms like Composio), developers operate on two tracks:

1. **Managed Auth (The Prototyping Fast-Track)**: You use shared, pre-configured credentials to get an integration working in five minutes. Great for demos and early traction.
2. **Custom Provider Apps (The Production Reality)**: As soon as you launch to real enterprise customers, you need your own client ID and secret. You need your own branding on the consent screen, your own dedicated API quotas, and your own compliance boundaries.

Moving from track 1 to track 2 is where developers get ambushed. Documentation is scattered across legacy developer portals, official turnaround estimates are often inaccurate, and small scope decisions (like asking for `drive.readonly` instead of `drive.file`) can trigger multi-thousand-dollar compliance audits.

---

## How It Works

We built a dual-engine system designed to balance instant answers with live research for unfamiliar tools:

```
[ User searches an app ]
           │
           ├──► Is it in the verified library?
           │    └── Yes: Returns instant 5-tier specification (<100ms)
           │
           └──► Unknown app / "Re-investigate live":
                │
                ├── 1. Exa Semantic Search: Identifies official dev docs & dev discussions in parallel (~4s)
                ├── 2. Firecrawl: Scrapes main-body documentation into clean markdown (~6s)
                ├── 3. Gemini Flash-Lite: Maps raw documentation into a strict TypeScript schema (~10s)
                └── 4. SSE Stream: Pushes real-time progress to the UI (~22s total)
```

### The 5 Difficulty Tiers

| Tier | Level | Typical Wait | Example | What Defines It |
|---|---|---|---|---|
| **1** | **Instant** | 0 days | GitHub | Self-serve portal, keys issued immediately, no review gates. |
| **2** | **Easy** | 0–2 days | Notion | Self-serve, but strictly requires legal prerequisites (live domain, Privacy Policy, ToS). |
| **3** | **Moderate** | 3–7 days | Slack | Direct workspace install is instant, but public distribution or App Directory requires review. |
| **4** | **Involved** | 2–4 weeks | Google Cloud | 100-user cap for unverified apps, video screencast demonstrations, CASA compliance tiers. |
| **5** | **Restricted** | 4–8 weeks | Salesforce | Mandatory commercial vetting, formal ISV partner agreements, $2,550+ security review fees. |

---

## Grounding & Evidence: What We Learned, Corrected, and Could Not Verify

One of the biggest mistakes with AI-generated developer documentation is uncritical acceptance of official marketing claims. We deliberately separate **what docs promise** from **what developers actually experience in the wild**:

### Case Studies

* **Google Cloud Console**:
  * *What official docs say*: App verification reviews take 2 to 3 business days.
  * *What community reports show*: Developers routinely report 2 to 4 weeks of back-and-forth rejections over video screencast formatting and OAuth consent screen domain verification.
  * *What we could not verify*: Passing criteria for Cloud Application Security Assessment (CASA) Tier 2 lab testing without an active audit contract.
* **Composio Custom Auth**:
  * *What official docs say*: Programmatic auth configuration supports custom credentials via dashboard and API.
  * *What community reports show*: The callback URI must match `https://backend.composio.dev/api/v3/toolkits/auth/callback` exactly. Using provider "Test & Install" buttons inside external consoles bypasses connection context and triggers runtime errors.
  * *What we could not verify*: Provider-specific consent UI without live credentials.
* **Salesforce Connected Apps**:
  * *What official docs say*: Any developer can spin up a Connected App in a developer scratch org.
  * *What community reports show*: Distributing that integration to external Salesforce orgs requires listing on the AppExchange, triggering a mandatory $2,550 annual security review fee.
  * *What we could not verify*: Onboarding partner flows without an active business entity and tax registration.

### Scrape Transparency in the Audit Ledger

Web scraping breaks all the time—anti-bot protections, Cloudflare challenges, or SPA rendering issues. Rather than pretending every page was cleanly scraped or hallucinating missing details, the system reports reality:
* If Firecrawl successfully parses the official documentation, it logs:
  `✓ Clean markdown extracted from docs.domain.com via Firecrawl`
* If a site blocks direct scraping via anti-bot challenges, it logs:
  `○ Direct scrape blocked (anti-bot / JS barrier). Gracefully fell back to Exa neural semantic excerpts.`
* If no official documentation exists, it logs:
  `? No direct official docs resolved; synthesized from developer community discussions.`

---

## Technical & Product Decisions

1. **Strict TypeScript Schema over Free-Form Text**: LLMs love generating long, meandering paragraphs. We forced Gemini to return a strict JSON schema (`OAuthGuide`). This guarantees every guide has comparable metrics: setup minutes, wait ranges, flow types, and explicit human requirements.
2. **Explicit "Requires Human" Tagging**: An AI agent cannot log into a user's Google Cloud account, complete SMS 2FA, or record a product walkthrough video. Every step explicitly flags whether it's an automated configuration step or requires human execution.
3. **Sub-30s Latency Target**: Free Vercel serverless functions time out at 60 seconds. Multi-agent loops that run for 3 minutes fail in production and frustrate users. By combining parallel Exa retrieval, targeted Firecrawl markdown scraping, and Gemini Flash-Lite, we consistently deliver full guides in 20 to 25 seconds.
4. **Resilient Model Cascade**: Gemini 503 capacity spikes happen during peak traffic. We implemented an automatic runtime fallback (`gemini-3.1-flash-lite` → `gemini-3.5-flash-lite` → `gemini-3.8-flash`) so temporary API spikes never crash user requests.

---

## Getting Started Locally

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/Jyothee4/composio-assignment.git
cd composio-assignment/oauth-guide
bun install
```

*(You can also use `npm install`, `pnpm install`, or `yarn`)*

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Add your keys to `.env.local`:

```bash
# Semantic discovery (https://exa.ai)
EXA_API_KEY=your_exa_api_key_here

# Targeted web scraping (https://firecrawl.dev)
FIRECRAWL_API_KEY=your_firecrawl_api_key_here

# Structured extraction (https://aistudio.google.com)
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note**: You don't need API keys to test the app. The five showcase apps (GitHub, Notion, Slack, Google, Salesforce) load instantly from the verified library. API keys are only invoked when you search an unfamiliar app or click **⚡ Re-investigate live**.

### 3. Start the Dev Server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploying to Vercel

1. Import the repository into your [Vercel](https://vercel.com) dashboard.
2. Set **Root Directory** to `oauth-guide`.
3. Add `EXA_API_KEY`, `FIRECRAWL_API_KEY`, and `GEMINI_API_KEY` under **Project Settings → Environment Variables**.
4. Deploy.

---

## Honest Limitations & What's Next

* **Authentication-Gated Consoles**: We cannot inspect internal dashboards behind SSO or 2FA (e.g., Apple Developer portal or private AWS IAM policies). The agent extracts guidance from public documentation and community reports.
* **Rate Limits on Free API Tiers**: The Google AI Studio free tier caps requests at ~20 calls per day. For production scaling, connecting a billing account lifts this ceiling to 1,500+ RPM.
* **Caching Layer**: Currently, repeated searches for unfamiliar apps run live queries every time. Adding an edge Redis layer (e.g. Upstash) would cache live investigation results for 7 days to eliminate redundant API spend.
