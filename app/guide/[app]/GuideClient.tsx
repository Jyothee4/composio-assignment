'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { OAuthGuide } from '@/types/guide'
import Link from 'next/link'

const DIFFICULTY_CONFIG = {
  1: { label: 'Instant', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-500' },
  2: { label: 'Easy', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', dot: 'bg-yellow-500' },
  3: { label: 'Moderate', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', dot: 'bg-orange-500' },
  4: { label: 'Involved', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' },
  5: { label: 'Restricted', color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200', dot: 'bg-gray-500' },
}

const SOURCE_LABEL = {
  reddit: 'Reddit',
  github: 'GitHub',
  stackoverflow: 'Stack Overflow',
  blog: 'Blog',
  forum: 'Forum',
}

function WaitTimeDisplay({ guide }: { guide: OAuthGuide }) {
  if (!guide.approval_required) {
    return <span className="text-green-600 font-medium">No approval needed</span>
  }
  const { approval_wait_days_min, approval_wait_days_max, approval_wait_source } = guide
  if (approval_wait_days_max === 0) return <span className="text-gray-500">Unknown</span>
  const timeStr =
    approval_wait_days_min === approval_wait_days_max
      ? `~${approval_wait_days_min} days`
      : `${approval_wait_days_min}–${approval_wait_days_max} days`
  return (
    <span>
      <span className="font-medium">{timeStr}</span>
      <span className="text-xs text-gray-400 ml-1">
        ({approval_wait_source === 'official' ? 'per docs' : approval_wait_source === 'community' ? 'community reports' : 'estimated'})
      </span>
    </span>
  )
}

export default function GuideClient({ appName }: { appName: string }) {
  const router = useRouter()
  const [guide, setGuide] = useState<OAuthGuide | null>(null)
  const [progress, setProgress] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const fetchedRef = useRef(false)

  const runInvestigation = async (forceLive = false) => {
    setLoading(true)
    setError(null)
    setProgress([])

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appName, forceLive }),
      })

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`)
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6))
            if (data.type === 'progress') {
              setProgress((p) => [...p, data.message])
            } else if (data.type === 'result') {
              setGuide(data.guide)
              setLoading(false)
            } else if (data.type === 'error') {
              setError(data.message)
              setLoading(false)
            }
          } catch {}
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    runInvestigation(false)
  }, [appName])

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const diff = guide ? DIFFICULTY_CONFIG[guide.difficulty] : null

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">O</span>
          </div>
          <span className="font-semibold text-gray-900">OAuthGuide</span>
        </Link>
        <div className="flex items-center gap-3">
          {guide && (
            <>
              <button
                onClick={() => runInvestigation(true)}
                disabled={loading}
                className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>⚡</span> Re-investigate live
              </button>
              <button
                onClick={copyUrl}
                className="text-xs text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-md transition-colors font-medium"
              >
                {copied ? '✓ Link copied!' : 'Share guide →'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Loading state */}
        {loading && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <h1 className="text-lg font-semibold text-gray-900">
                Investigating OAuth for {appName}...
              </h1>
            </div>
            <div className="space-y-2 pl-7">
              {progress.map((msg, i) => (
                <div key={i} className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  {msg}
                </div>
              ))}
              <div className="text-sm text-gray-400 flex items-center gap-2">
                <span className="w-3 h-3 border border-gray-300 border-t-gray-600 rounded-full animate-spin inline-block" />
                Executing agent pipeline...
              </div>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-5 space-y-3">
            <div className="flex items-center gap-2 text-red-800 font-medium text-sm">
              <span>⚠️</span> Investigation notice
            </div>
            <p className="text-sm text-red-700">{error}</p>
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => router.push('/')}
                className="text-xs bg-white text-gray-700 border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50"
              >
                ← Back to app list
              </button>
              <button
                onClick={() => runInvestigation(false)}
                className="text-xs bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Guide */}
        {guide && !loading && (
          <div className="space-y-8">
            {/* Title + Score */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{guide.app_name}</h1>
                  {guide.app_domain && (
                    <p className="text-sm text-gray-400 mt-0.5">{guide.app_domain}</p>
                  )}
                </div>
                {diff && (
                  <div className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full border ${diff.bg} ${diff.border}`}>
                    <span className={`w-2 h-2 rounded-full ${diff.dot}`} />
                    <span className={`text-sm font-semibold ${diff.color}`}>Tier {guide.difficulty}: {diff.label}</span>
                  </div>
                )}
              </div>
            </div>

            {/* OAuth not found */}
            {!guide.oauth_exists && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700">No public OAuth found</p>
                {guide.oauth_not_found_reason && (
                  <p className="text-sm text-gray-500 mt-1">{guide.oauth_not_found_reason}</p>
                )}
              </div>
            )}

            {/* Key metrics */}
            {guide.oauth_exists && (
              <div className="grid grid-cols-3 gap-3">
                <div className="border border-gray-100 rounded-lg p-3 bg-gray-50/50">
                  <p className="text-xs text-gray-400 mb-1">Setup time</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {guide.setup_time_minutes < 60
                      ? `~${guide.setup_time_minutes} min`
                      : `~${Math.round(guide.setup_time_minutes / 60)}h`}
                  </p>
                </div>
                <div className="border border-gray-100 rounded-lg p-3 bg-gray-50/50">
                  <p className="text-xs text-gray-400 mb-1">Approval wait</p>
                  <p className="text-sm"><WaitTimeDisplay guide={guide} /></p>
                </div>
                <div className="border border-gray-100 rounded-lg p-3 bg-gray-50/50">
                  <p className="text-xs text-gray-400 mb-1">OAuth flow</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">
                    {guide.oauth_flow_type.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
            )}

            {/* Difficulty reason */}
            {guide.difficulty_reason && (
              <div className={`rounded-lg p-4 border ${diff?.bg} ${diff?.border}`}>
                <p className={`text-sm ${diff?.color} leading-relaxed`}>{guide.difficulty_reason}</p>
              </div>
            )}

            {/* Prerequisites */}
            {guide.prerequisites.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                  Before you start
                </h2>
                <ul className="space-y-2">
                  {guide.prerequisites.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-gray-400 mt-0.5 font-mono">□</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Steps */}
            {guide.steps.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Step-by-step setup
                  </h2>
                  {guide.portal_url && (
                    <a
                      href={guide.portal_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Developer portal →
                    </a>
                  )}
                </div>
                <div className="space-y-4">
                  {guide.steps.map((step) => (
                    <div key={step.number} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-semibold mt-0.5">
                        {step.number}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-gray-900">{step.title}</p>
                          {step.requires_human && (
                            <span className="text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-medium">
                              Requires human
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                        {step.url && (
                          <a
                            href={step.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline mt-1.5 inline-block"
                          >
                            {step.url} →
                          </a>
                        )}
                        {step.requires_human && step.human_reason && (
                          <p className="text-xs text-amber-700 mt-1 italic">Why: {step.human_reason}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Approval */}
            {guide.approval_required && guide.approval_triggers.length > 0 && (
              <section className="bg-orange-50/50 border border-orange-200/70 rounded-lg p-4">
                <h2 className="text-sm font-semibold text-orange-950 uppercase tracking-wider mb-2">
                  Approval triggers & requirements
                </h2>
                <p className="text-xs text-orange-800 mb-2">Review is required if any of these apply:</p>
                <ul className="space-y-1.5">
                  {guide.approval_triggers.map((t, i) => (
                    <li key={i} className="text-xs text-orange-900 flex items-start gap-2">
                      <span className="text-orange-500 font-bold">•</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Blockers */}
            {guide.known_blockers.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                  Known blockers & gotchas
                </h2>
                <div className="space-y-2">
                  {guide.known_blockers.map((b, i) => (
                    <div key={i} className="flex items-start gap-2.5 bg-red-50/70 border border-red-100 rounded-lg px-3.5 py-2.5">
                      <span className="text-red-500 text-xs mt-0.5">⚠️</span>
                      <p className="text-sm text-red-900 leading-relaxed">{b}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Scopes */}
            {guide.scopes_available.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                  Permissions & Scopes
                </h2>
                <div className="space-y-2">
                  {guide.scopes_available.map((scope, i) => (
                    <div key={i} className="flex items-start gap-3 p-2 rounded border border-gray-100 bg-gray-50/30">
                      <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono text-gray-800 flex-shrink-0 mt-0.5">
                        {scope.name}
                      </code>
                      <div className="flex-1">
                        <span className="text-xs text-gray-600">{scope.description}</span>
                        {scope.requires_review && (
                          <span className="ml-2 text-[11px] text-red-600 font-semibold bg-red-50 border border-red-200 px-1.5 py-0.2 rounded">
                            Triggers review
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* What agent did */}
            {guide.agent_verified.length > 0 && (
              <section className="bg-gray-50 border border-gray-200/80 rounded-lg p-4">
                <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
                  Verification & Evidence Ledger
                </h2>
                <div className="space-y-2">
                  {guide.agent_verified.map((v, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className={
                        v.status === 'verified' || v.status === 'found' ? 'text-green-600 font-bold' :
                        v.status === 'attempted' ? 'text-amber-500 font-bold' : 'text-gray-400 font-bold'
                      }>
                        {v.status === 'verified' || v.status === 'found' ? '✓' :
                         v.status === 'attempted' ? '○' : '?'}
                      </span>
                      <div>
                        <span className="text-gray-900 font-medium">{v.action}</span>
                        {v.note && <span className="text-gray-500 ml-1.5">— {v.note}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Community insights */}
            {guide.community_insights.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-1">
                  What developers report (Community signals)
                </h2>
                <p className="text-xs text-gray-400 mb-3">
                  Real-world experiences from developer forums, Reddit, and GitHub discussions
                </p>
                <div className="space-y-2.5">
                  {guide.community_insights.map((c, i) => (
                    <div key={i} className="border border-gray-100 rounded-lg p-3 bg-white shadow-sm">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-100 px-1.5 py-0.5 rounded">
                          {SOURCE_LABEL[c.source_type]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed italic">"{c.insight}"</p>
                      {c.source_url && (
                        <a
                          href={c.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline mt-2 inline-block font-medium"
                        >
                          View discussion →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Official sources */}
            {guide.official_sources.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                  Official Sources & Documentation
                </h2>
                <div className="space-y-1.5">
                  {guide.official_sources.map((s, i) => (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                      <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium">Docs</span>
                      <span>{s.title}</span>
                      <span className="text-xs text-gray-400">↗</span>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Footer */}
            <div className="border-t border-gray-100 pt-6 flex items-center justify-between text-xs text-gray-400">
              <p>
                Verified at {new Date(guide.generated_at).toLocaleDateString()}
              </p>
              <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium">
                ← Search another application
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
