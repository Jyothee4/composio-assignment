# OAuthGuide

**Clear, actionable OAuth setup guidance for developers and AI agent builders.**

OAuthGuide solves developer uncertainty when building third-party app connections. Instead of piecing together scattered documentation, wondering whether approval will take 30 minutes or 4 weeks, or getting blocked by hidden verification policies, developers get an instant, shareable roadmap.

---

## 🌟 Key Features

1. **Computed Difficulty Tiers (1–5)**: Upfront certainty on setup friction:
   - **Tier 1 (Instant)**: Fully self-serve, zero review gates (e.g., GitHub).
   - **Tier 2 (Easy)**: Self-serve with prerequisites like Privacy Policy or live domains (e.g., Notion).
   - **Tier 3 (Moderate)**: Review queues for public distribution / directory listings (e.g., Slack).
   - **Tier 4 (Involved)**: Scope-dependent verification, screencasts, and 100-user caps (e.g., Google Cloud).
   - **Tier 5 (Restricted)**: Mandatory enterprise security audits, fees, and partner vetting (e.g., Salesforce).
2. **Dual-Lens Intelligence (Official Docs vs. Community Signals)**:
   - Official specs tell developers what providers document.
   - Community insights (from Reddit, GitHub issues, and developer forums) reveal real wait times, undocumented gotchas, and why reviews get rejected.
3. **Evidence & Verification Ledger**:
   - Transparently distinguishes what was verified from live documentation, what protocol checks were attempted, and where human intervention is strictly required.
4. **Live Agent Investigation**:
   - Submit **any unfamiliar app or URL**. The agent conducts real-time semantic discovery, crawls deep documentation via Firecrawl, and extracts structured guidance using Gemini 2.0 Flash with live streaming progress.

---

## 🚀 Quickstart & Setup

### 1. Clone & install dependencies

```bash
git clone <repo-url>
cd oauth-guide
bun install
```

*(You can also use `npm install`, `pnpm install`, or `yarn`)*

### 2. Configure Environment Variables

```bash
cp .env.example .env.local
```

Populate `.env.local` with your API keys:

```bash
# Semantic web discovery (https://exa.ai)
EXA_API_KEY=your_exa_api_key_here

# Deep documentation crawling (https://firecrawl.dev)
FIRECRAWL_API_KEY=your_firecrawl_api_key_here

# Structured extraction reasoning (https://aistudio.google.com)
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note**: The 5 showcase apps (GitHub, Notion, Slack, Google, Salesforce) run instantly from the verified library without requiring API keys. API keys are only needed when running live investigations on unfamiliar apps or clicking **⚡ Re-investigate live**.

### 3. Run Development Server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Architecture & Core Decisions

```
[ User Input: App Name / Website ]
                 │
      ┌──────────┴──────────┐
      ▼                     ▼
[Showcase Library]    [Live Agent Pipeline]
(Instant 5-Tier Spec)       │
                     ┌──────┴──────────────────────┐
                     ▼                             ▼
              [Exa AI Discovery]          [Community Signal Mining]
           (Finds official portal)      (Reddit, GitHub, dev blogs)
                     │                             │
                     ▼                             │
             [Firecrawl Crawler]                   │
          (Deep markdown extraction)               │
                     │                             │
                     └──────────────┬──────────────┘
                                    ▼
                       [Gemini 2.0 Flash Extraction]
                         (Schema-enforced JSON)
                                    │
                                    ▼
                         [Real-Time SSE Stream]
                                    │
                                    ▼
                          [Interactive Guide UI]
```

### Key Product Decisions:
1. **Schema-Driven Extraction Over Free-Form Text**: Rather than asking an LLM to generate unstructured markdown guides, the agent fills a strict TypeScript schema. This ensures every guide is comparable, consistent, and cleanly rendered.
2. **Separation of Evidence**: What the provider claims (e.g., Google stating "2-3 business days") is explicitly contrasted with community experience (developers reporting "2-4 weeks with video screencast revisions").
3. **No Hardcoded Credentials**: Strictly zero credentials committed to repository. Uses `.env.local` for local development and standard environment variables for deployment.

---

## 🚢 Deployment to Vercel

1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. If deploying from a repository where `oauth-guide` is a subdirectory, set **Root Directory** to `oauth-guide`.
4. Add `EXA_API_KEY`, `FIRECRAWL_API_KEY`, and `GEMINI_API_KEY` under **Environment Variables**.
5. Click **Deploy**.

---

## ⚠️ Known Limitations

- **Gated Portals**: Some platforms require logging in or completing an organization identity check before showing app registration screens; the agent cannot bypass authentication gates.
- **Dynamic Scope Changes**: Providers frequently revise sensitive and restricted scope lists; community reports help catch discrepancies when documentation lags behind.
