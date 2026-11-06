'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const FEATURED_APPS = [
  { name: 'GitHub', domain: 'github.com', tier: 1, label: 'Instant' },
  { name: 'Notion', domain: 'notion.so', tier: 2, label: 'Easy' },
  { name: 'Slack', domain: 'slack.com', tier: 3, label: 'Moderate' },
  { name: 'Google', domain: 'google.com', tier: 4, label: 'Involved' },
  { name: 'Salesforce', domain: 'salesforce.com', tier: 5, label: 'Restricted' },
]

const TIER_COLORS: Record<number, string> = {
  1: 'bg-green-100 text-green-800 border-green-200',
  2: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  3: 'bg-orange-100 text-orange-800 border-orange-200',
  4: 'bg-red-100 text-red-800 border-red-200',
  5: 'bg-gray-100 text-gray-800 border-gray-200',
}

const TIER_DOTS: Record<number, string> = {
  1: 'bg-green-500',
  2: 'bg-yellow-500',
  3: 'bg-orange-500',
  4: 'bg-red-500',
  5: 'bg-gray-500',
}

export default function Home() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSearch = (appName: string) => {
    if (!appName.trim()) return
    setLoading(true)
    router.push(`/guide/${encodeURIComponent(appName.trim())}`)
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">O</span>
          </div>
          <span className="font-semibold text-gray-900">OAuthGuide</span>
        </div>
        <a
          href="https://github.com/Jyothee4/composio-assignment"
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub →
        </a>
      </div>

      {/* Hero */}
      <div className="max-w-2xl mx-auto px-6 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-600 mb-6">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          Live agent · Searches real docs
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
          OAuth setup guides for any app
        </h1>
        <p className="text-lg text-gray-500 mb-10">
          Search any app. Get a complete guide — setup steps, approval timeline,
          known blockers, and what the agent verified live.
        </p>

        {/* Search */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSearch(query)
          }}
          className="flex gap-2 max-w-lg mx-auto"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Notion, Stripe, HubSpot..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            autoFocus
          />
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="px-5 py-3 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '...' : 'Generate'}
          </button>
        </form>
      </div>

      {/* Featured Apps */}
      <div className="max-w-2xl mx-auto px-6 pb-20">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-4 font-medium">
          Example apps across all difficulty tiers
        </p>
        <div className="grid grid-cols-1 gap-2">
          {FEATURED_APPS.map((app) => (
            <button
              key={app.name}
              onClick={() => handleSearch(app.name)}
              className="flex items-center justify-between w-full px-4 py-3 border border-gray-100 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${TIER_DOTS[app.tier]}`} />
                <span className="text-sm font-medium text-gray-900">{app.name}</span>
                <span className="text-xs text-gray-400">{app.domain}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border font-medium ${TIER_COLORS[app.tier]}`}
                >
                  {app.label}
                </span>
                <span className="text-gray-300 group-hover:text-gray-500 transition-colors text-sm">→</span>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Not listed? Type any app name above. The agent will investigate it live.
        </p>
      </div>
    </main>
  )
}
