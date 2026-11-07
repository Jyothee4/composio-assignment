# OAuthGuide

> **Executive Summary**: Building an AI agent takes an afternoon; getting enterprise OAuth credentials to connect that agent to real-world user data (Google, Slack, Salesforce) often stalls product launches for weeks. OAuthGuide solves this last-mile integration blind spot by giving developers instant, verifiable roadmaps—difficulty tiers, real wait times, gotchas, and step-by-step guidance—generated either instantly from a verified 5-tier library or live in ~22 seconds for any arbitrary app.

---

## ⚡ Quickstart Setup

### Local Development (3 Steps)

```bash
# 1. Clone & install
git clone https://github.com/Jyothee4/composio-assignment.git
cd composio-assignment/oauth-guide
bun install   # npm, pnpm, or yarn also work

# 2. Configure environment (keys needed only for live investigation of unlisted apps)
cp .env.example .env.local
# Add: EXA_API_KEY, FIRECRAWL_API_KEY, GEMINI_API_KEY to .env.local

# 3. Start dev server
bun dev
```
Open [http://localhost:3000](http://localhost:3000). 

*Note: The 5 showcase apps (GitHub, Notion, Slack, Google, Salesforce) load instantly from the local library with zero API keys required.*

### Vercel Deployment
1. Import repo into Vercel.
2. Set **Root Directory** to `oauth-guide`.
3. Add `EXA_API_KEY`, `FIRECRAWL_API_KEY`, and `GEMINI_API_KEY` under **Environment Variables**.
4. Deploy.

---

## 🧭 Key Decisions Across Our Build Journey

As product managers and consultants evaluate technical prototypes, the code matters—but the **strategic trade-offs and decision velocity** matter more. Here are the 6 pivotal product and architectural decisions that shaped OAuthGuide:

### 1. Dual-Track Architecture (Showcase Library + Live Agent Pipeline)
* **The Dilemma**: Should we manually write a static catalog of 100 apps, or rely 100% on live autonomous search?
* **The Decision**: **A hybrid dual-engine model**. Writing 100 static guides creates immediate maintenance debt and rots as provider policies change. Relying solely on live search creates cold-start latency and potential API rate limit failures during interviews. We built an instant, pre-verified 5-tier benchmark library (GitHub to Salesforce) for immediate zero-latency evaluation, backed by an autonomous live agent pipeline (Exa + Firecrawl + Gemini) that investigates any long-tail app in ~22 seconds.

### 2. Schema-Driven Extraction Over Unstructured LLM Prose
* **The Dilemma**: Early prototypes prompted LLMs to output free-form markdown setup guides.
* **The Decision**: **Enforce a strict TypeScript schema (`OAuthGuide`)**. Free-form LLM output produces inconsistent headings, subjective time estimates, and unparseable steps. Enforcing structured JSON extraction guarantees that every app—whether Google or an obscure SaaS—is evaluated on identical parameters: normalized difficulty (1–5), numeric setup minutes, approval wait day ranges, specific review triggers, and structured human-in-the-loop flags.

### 3. Explicit Division of Labor (`👤 Requires Human Action`)
* **The Dilemma**: AI agent tools often over-promise "full automation," leaving developers confused when a script abruptly halts at a login screen.
* **The Decision**: **Unambiguous human handoff demarcation**. An AI agent cannot complete SMS 2FA, upload corporate tax filings, or record a required YouTube screencast demonstrating OAuth consent flows. Every setup step is categorized: automated configuration vs. `Requires human action`. This builds immediate credibility with engineering teams.

### 4. Dual-Lens Truth (Official Docs vs. Community Reality)
* **The Dilemma**: Official provider documentation routinely downplays review friction (e.g., Google stating app verification takes "2–3 business days").
* **The Decision**: **Mine community discussions (GitHub issues, Reddit, Stack Overflow) in parallel with official docs**. Developers don't get blocked by what is in the documentation—they get blocked by undocumented gotchas (e.g., Google rejecting OAuth consent screens due to unverified privacy policy domains, or video formatting nuances that stretch review times to 4 weeks). We separate official claims from community ground truth.

### 5. Scrape Transparency & Anti-Bot Fallback in the Audit Ledger
* **The Dilemma**: Web scrapers frequently encounter Cloudflare challenges, bot protections, or empty single-page application shells.
* **The Decision**: **Honest engineering transparency over silent failure**. When Firecrawl successfully scrapes clean markdown, the audit ledger states `✓ Clean markdown extracted via Firecrawl`. When a provider blocks direct scraping, the agent doesn't hallucinate or fail—it logs `○ Direct scrape blocked by provider anti-bot; gracefully fell back to Exa neural semantic excerpts`. This aligns directly with enterprise compliance expectations: show what was tested, what was verified, and what remains uncertain.

### 6. Sub-30s Latency Budget & Resilient Model Fallback
* **The Dilemma**: Heavy reasoning models or multi-agent debate loops take 60–90+ seconds, causing Vercel serverless timeouts and high bounce rates.
* **The Decision**: **Engineered a ~22-second pipeline using Gemini Flash-Lite with an automatic cascade**. We coupled Exa's parallel neural retrieval (URL + cleaned text in ~4s), Firecrawl's main-body scraper (~6s), and Gemini Flash-Lite (~10s). To insulate against peak-hour 503 capacity spikes, the backend dynamically falls back through a model chain (`gemini-3.1-flash-lite` → `gemini-3.5-flash-lite` → `gemini-3.8-flash`) before failing.

---

## ⚖️ Known Limitations & Production Horizon

* **Gated Developer Consoles**: The agent cannot authenticate into portals requiring paid corporate memberships (e.g., Apple Developer Program) or internal corporate SSO. Guidance for these tools is synthesized from public policies and verified developer discussions.
* **Free-Tier Rate Ceilings**: The Google AI Studio free tier caps requests at ~20 calls per project per day. In production, this requires linking a Google Cloud billing account (lifting the quota to 1,500+ RPM).
* **Caching Layer**: Currently, identical searches for long-tail apps run live queries every time. Adding an edge Redis layer (e.g., Upstash) would cache live investigation results for 7 days, reducing external API spend by >75%.
