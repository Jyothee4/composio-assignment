# OAuthGuide

Building an AI agent is fast. What usually slows developers down is connecting that agent to real apps like Google, Slack, Notion, or Salesforce. 

Setting up OAuth apps with these providers is painful because you don't know what to expect. Does setup take 15 minutes, or are you looking at a 3-week security review? Do you need a live privacy policy before you can even get API keys?

OAuthGuide gives you an answer in about 20 seconds. It shows you the setup steps, estimated wait times, known gotchas, and whether a step needs a human or can be automated.

## Setup Instructions

### Running Locally

1. Clone the repo and install dependencies:
```bash
git clone https://github.com/Jyothee4/composio-assignment.git
cd composio-assignment/oauth-guide
bun install
```
*(You can also use npm, pnpm, or yarn)*

2. Copy the environment file:
```bash
cp .env.example .env.local
```
Add your API keys to `.env.local`:
- `EXA_API_KEY` (for search)
- `FIRECRAWL_API_KEY` (for scraping)
- `GEMINI_API_KEY` (for extracting the guide)

*Note: You can test the 5 showcase apps (GitHub, Notion, Slack, Google, Salesforce) right away without any API keys. Keys are only used when you search an unlisted app or click Re-investigate live.*

3. Start the app:
```bash
bun dev
```
Open http://localhost:3000 in your browser.

### Deploying to Vercel

1. Import this repo into Vercel.
2. Set the Root Directory to `oauth-guide`.
3. Add your three keys (`EXA_API_KEY`, `FIRECRAWL_API_KEY`, `GEMINI_API_KEY`) under Environment Variables.
4. Hit Deploy.

## Key Decisions We Made

Here are the main decisions we made while building this:

1. **Pre-built library + live agent fallback**  
   Instead of trying to manually write guides for 100 apps (which would quickly go out of date), we built 5 thorough showcase apps across different difficulty tiers, and backed them with a live agent. If an app isn't in the library, the agent searches the web, reads the docs, and generates the guide on the spot.

2. **Strict JSON schema instead of free-form text**  
   Early on, asking the model to write a markdown guide led to messy, inconsistent results. We switched to a strict JSON schema. This makes sure every guide gives developers the exact same core numbers: setup time in minutes, approval wait in days, and a clean list of steps and blockers.

3. **Clearly labeling what needs a human**  
   An AI agent can't log into a private Google Cloud account, pass two-factor auth, or record a product demo video. We explicitly label steps that require human action so developers know where code stops and they have to take over.

4. **Looking at community discussions, not just official docs**  
   Official docs often make approval sound easy (like Google claiming verification takes "2-3 business days"). In reality, developers on Reddit and GitHub report 2 to 4 weeks of waiting and multiple video rejections. We pull in real developer discussions so people know what to actually expect.

5. **Being honest when scraping gets blocked**  
   Web scrapers run into Cloudflare challenges and bot blocks all the time. When Firecrawl can't scrape a page directly, we don't pretend it worked. The app falls back to semantic search excerpts and clearly states in the audit log that direct scraping was blocked.

6. **Keeping total search time under 30 seconds**  
   Vercel serverless functions time out after 60 seconds, and nobody wants to wait 2 minutes for a search. We used Exa for fast parallel search, Firecrawl for main-body scraping, and Gemini Flash-Lite for quick JSON extraction. The whole live search finishes in around 20 to 25 seconds. We also added a model fallback list in case Google hits temporary capacity limits.

## Limitations

- **Private developer portals:** The agent can only read public documentation and public developer forums. It cannot log into dashboards that sit behind paid accounts or corporate logins (like the Apple Developer Program).
- **Free tier API limits:** Gemini's free tier has a daily request limit (~20 requests per day). For production traffic, you would need a paid API tier.
- **No database caching yet:** If two people search the same unlisted app, the agent runs the live search twice. In a production version, we would add Redis to cache search results for 7 days.
