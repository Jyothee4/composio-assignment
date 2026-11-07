'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { OAuthGuide } from '@/types/guide'
import Link from 'next/link'

const DIFFICULTY_CONFIG = {
  1: { label: 'Instant', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  2: { label: 'Easy', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500' },
  3: { label: 'Moderate', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', dot: 'bg-orange-500' },
  4: { label: 'Involved', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', dot: 'bg-rose-500' },
  5: { label: 'Restricted', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', dot: 'bg-purple-500' },
}

const SOURCE_LABEL: Record<string, string> = {
  reddit: 'Reddit',
  github: 'GitHub',
  stackoverflow: 'Stack Overflow',
  blog: 'Engineering Blog',
  forum: 'Developer Forum',
}

function WaitTimeDisplay({ guide }: { guide: OAuthGuide }) {
  if (!guide.approval_required) {
    return <span className="text-emerald-600 font-semibold">No approval needed</span>
  }
  const { approval_wait_days_min, approval_wait_days_max, approval_wait_source } = guide
  if (approval_wait_days_max === 0) return <span className="text-gray-600 font-semibold">Instant / Self-serve</span>
  const timeStr =
    approval_wait_days_min === approval_wait_days_max
      ? `~${approval_wait_days_min} days`
      : `${approval_wait_days_min}–${approval_wait_days_max} days`
  return (
    <div>
      <span className="font-semibold text-gray-900">{timeStr}</span>
      <span className="text-[11px] text-gray-500 block font-normal">
        {approval_wait_source === 'official' ? 'per official docs' : approval_wait_source === 'community' ? 'per developer reports' : 'estimated'}
      </span>
    </div>
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
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Navbar */}
      <div className="bg-white border-b border-gray-200/80 px-6 py-3.5 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">O</span>
            </div>
            <span className="font-semibold text-gray-900 tracking-tight">OAuthGuide</span>
          </Link>
          <div className="flex items-center gap-2.5">
            {guide && (
              <>
                <button
                  onClick={() => runInvestigation(true)}
                  disabled={loading}
                  className="text-xs bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 font-medium shadow-sm disabled:opacity-50"
                >
                  <span>⚡</span> Re-investigate live
                </button>
                <button
                  onClick={copyUrl}
                  className="text-xs bg-black text-white hover:bg-gray-800 px-3 py-1.5 rounded-md transition-colors font-medium shadow-sm"
                >
                  {copied ? '✓ Link copied!' : 'Share guide →'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pt-8">
        {/* Loading state */}
        {loading && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <h1 className="text-lg font-semibold text-gray-900">
                Investigating OAuth for {appName}...
              </h1>
            </div>
            <div className="space-y-2.5 pl-8 border-l-2 border-gray-100">
              {progress.map((msg, i) => (
                <div key={i} className="text-sm text-gray-700 flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{msg}</span>
                </div>
              ))}
              <div className="text-sm text-gray-400 flex items-center gap-2 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Deep crawling official documentation and developer sources...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-rose-800 font-semibold text-sm">
              <span>⚠️</span> Investigation notice
            </div>
            <p className="text-sm text-rose-700 leading-relaxed">{error}</p>
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => router.push('/')}
                className="text-xs bg-white text-gray-700 border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50"
              >
                ← Back to app list
              </button>
              <button
                onClick={() => runInvestigation(false)}
                className="text-xs bg-rose-600 text-white px-3 py-1.5 rounded hover:bg-rose-700"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Guide Content */}
        {guide && !loading && (
          <div className="space-y-6">
            {/* Header Hero Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{guide.app_name}</h1>
                  {guide.app_domain && (
                    <p className="text-sm text-gray-400 font-mono mt-0.5">{guide.app_domain}</p>
                  )}
                </div>
                {diff && (
                  <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border self-start ${diff.bg} ${diff.border}`}>
                    <span className={`w-2 h-2 rounded-full ${diff.dot}`} />
                    <span className={`text-sm font-semibold ${diff.color}`}>Tier {guide.difficulty}: {diff.label}</span>
                  </div>
                )}
              </div>

              {/* Verified Sources Action Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {guide.portal_url && (
                  <a
                    href={guide.portal_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors"
                  >
                    <span>Developer Console</span>
                    <span className="text-gray-400">↗</span>
                  </a>
                )}
                {guide.official_sources?.[0]?.url && (
                  <a
                    href={guide.official_sources[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 px-3 py-1.5 rounded-md transition-colors"
                  >
                    <span>Official Documentation</span>
                    <span className="text-blue-500">↗</span>
                  </a>
                )}
              </div>

              {/* Key Metrics Grid */}
              {guide.oauth_exists && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="border border-gray-100 rounded-lg p-3.5 bg-slate-50/50">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Setup time</p>
                    <p className="text-base font-semibold text-gray-900">
                      {guide.setup_time_minutes < 60
                        ? `~${guide.setup_time_minutes} min`
                        : `~${Math.round(guide.setup_time_minutes / 60)}h`}
                    </p>
                  </div>
                  <div className="border border-gray-100 rounded-lg p-3.5 bg-slate-50/50">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Approval wait</p>
                    <WaitTimeDisplay guide={guide} />
                  </div>
                  <div className="border border-gray-100 rounded-lg p-3.5 bg-slate-50/50">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">OAuth flow</p>
                    <p className="text-base font-semibold text-gray-900 capitalize">
                      {guide.oauth_flow_type.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
              )}

              {/* Difficulty explanation */}
              {guide.difficulty_reason && (
                <div className={`rounded-lg p-4 border text-sm leading-relaxed ${diff?.bg} ${diff?.border} ${diff?.color}`}>
                  {guide.difficulty_reason}
                </div>
              )}
            </div>

            {/* Prerequisites Checklist */}
            {guide.prerequisites.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                  Prerequisites Checklist (Before you start)
                </h2>
                <div className="space-y-2.5">
                  {guide.prerequisites.map((p, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-gray-800">
                      <span className="w-4 h-4 mt-0.5 rounded border border-gray-300 flex items-center justify-center text-[10px] text-gray-400 flex-shrink-0">
                        □
                      </span>
                      <span className="leading-relaxed font-medium">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step-by-Step Setup */}
            {guide.steps.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Step-by-Step Setup Guide
                  </h2>
                  {guide.portal_url && (
                    <a
                      href={guide.portal_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                    >
                      <span>Open console</span>
                      <span>↗</span>
                    </a>
                  )}
                </div>

                <div className="space-y-6">
                  {guide.steps.map((step) => (
                    <div key={step.number} className="flex gap-4">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold mt-0.5">
                        {step.number}
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-gray-900">{step.title}</h3>
                          {step.requires_human && (
                            <span className="inline-flex items-center gap-1 text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                              <span>👤</span>
                              <span>Requires human action</span>
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>

                        {step.requires_human && step.human_reason && (
                          <p className="text-xs text-amber-700 bg-amber-50/60 border border-amber-100 rounded px-2.5 py-1">
                            <span className="font-semibold">Why human required:</span> {step.human_reason}
                          </p>
                        )}

                        {step.url && (
                          <div className="pt-1">
                            <a
                              href={step.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
                            >
                              <span>Verify step in documentation</span>
                              <span>↗</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approval Triggers & Blockers */}
            {(guide.approval_triggers.length > 0 || guide.known_blockers.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Triggers */}
                {guide.approval_triggers.length > 0 && (
                  <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl p-5 space-y-3">
                    <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>⚠️</span>
                      <span>Approval Triggers</span>
                    </h3>
                    <p className="text-xs text-amber-800">
                      Provider review is triggered if any of these conditions apply:
                    </p>
                    <ul className="space-y-2">
                      {guide.approval_triggers.map((t, i) => (
                        <li key={i} className="text-xs text-amber-950 flex items-start gap-2 leading-relaxed">
                          <span className="text-amber-500 font-bold mt-0.5">•</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Blockers */}
                {guide.known_blockers.length > 0 && (
                  <div className="bg-rose-50/60 border border-rose-200/70 rounded-xl p-5 space-y-3">
                    <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>⛔</span>
                      <span>Known Gotchas & Blockers</span>
                    </h3>
                    <p className="text-xs text-rose-800">
                      Common failure points developers report encountering:
                    </p>
                    <ul className="space-y-2">
                      {guide.known_blockers.map((b, i) => (
                        <li key={i} className="text-xs text-rose-950 flex items-start gap-2 leading-relaxed">
                          <span className="text-rose-500 font-bold mt-0.5">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Scopes & Permissions */}
            {guide.scopes_available.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                  Scopes & Review Thresholds
                </h2>
                <div className="space-y-2">
                  {guide.scopes_available.map((scope, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg border border-gray-100 bg-slate-50/40">
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-100 text-gray-800 font-mono px-2 py-0.5 rounded font-semibold">
                          {scope.name}
                        </code>
                        <span className="text-xs text-gray-600">{scope.description}</span>
                      </div>
                      {scope.requires_review && (
                        <span className="text-[11px] text-rose-700 font-semibold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded self-start sm:self-auto">
                          Triggers Review
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What Developers Report (Community Evidence) */}
            {guide.community_insights.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
                <div>
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Community Signals (What Developers Report)
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Real-world reports from developer forums, GitHub issues, and discussion threads
                  </p>
                </div>
                <div className="space-y-3">
                  {guide.community_insights.map((c, i) => (
                    <div key={i} className="border border-gray-100 rounded-lg p-4 bg-slate-50/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                          {SOURCE_LABEL[c.source_type] || c.source_type}
                        </span>
                        {c.source_url && (
                          <a
                            href={c.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                          >
                            <span>Open source discussion</span>
                            <span>↗</span>
                          </a>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 italic leading-relaxed">"{c.insight}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Agent Verification & Audit Ledger */}
            {guide.agent_verified.length > 0 && (
              <div className="bg-slate-50 border border-gray-200 rounded-xl p-5 space-y-3">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Agent Verification & Audit Ledger
                </h2>
                <div className="space-y-2">
                  {guide.agent_verified.map((v, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs">
                      <span className={
                        v.status === 'verified' || v.status === 'found' ? 'text-emerald-600 font-bold' :
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
              </div>
            )}

            {/* Official Sources */}
            {guide.official_sources.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-3">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Official Primary Sources
                </h2>
                <div className="space-y-2">
                  {guide.official_sources.map((s, i) => (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded">
                          Official Docs
                        </span>
                        <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                          {s.title}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 group-hover:text-blue-600 font-medium flex items-center gap-1">
                        <span>Read docs</span>
                        <span>↗</span>
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-4 flex items-center justify-between text-xs text-gray-400">
              <p>
                Specification verified at {new Date(guide.generated_at).toLocaleDateString()}
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
