export interface OAuthGuide {
  app_name: string
  app_domain: string
  oauth_exists: boolean
  oauth_not_found_reason?: string

  // Difficulty
  difficulty: 1 | 2 | 3 | 4 | 5
  difficulty_label: 'Instant' | 'Easy' | 'Moderate' | 'Involved' | 'Restricted'
  difficulty_reason: string

  // Time estimates
  setup_time_minutes: number
  approval_wait_days_min: number
  approval_wait_days_max: number
  approval_wait_source: 'official' | 'community' | 'estimated'

  // Approval
  approval_required: boolean
  approval_type: 'none' | 'self-serve' | 'review' | 'partnership' | 'audit'
  approval_triggers: string[]

  // Flow
  oauth_flow_type: 'authorization_code' | 'pkce' | 'client_credentials' | 'device' | 'unknown'
  portal_url: string

  // Prerequisites
  prerequisites: string[]

  // Steps
  steps: Step[]

  // Scopes
  scopes_available: Scope[]
  scopes_triggering_review: string[]

  // Blockers
  known_blockers: string[]

  // What agent did
  agent_verified: AgentVerification[]

  // Sources
  official_sources: Source[]
  community_insights: CommunityInsight[]

  generated_at: string
}

export interface Step {
  number: number
  title: string
  description: string
  url?: string
  requires_human: boolean
  human_reason?: string
}

export interface Scope {
  name: string
  description: string
  requires_review: boolean
}

export interface AgentVerification {
  action: string
  status: 'verified' | 'found' | 'attempted' | 'could_not_verify'
  note?: string
}

export interface Source {
  title: string
  url: string
  type: 'official_docs' | 'official_policy' | 'official_portal'
}

export interface CommunityInsight {
  insight: string
  source_url?: string
  source_type: 'reddit' | 'github' | 'stackoverflow' | 'blog' | 'forum'
}
