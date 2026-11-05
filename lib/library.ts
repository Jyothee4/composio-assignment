import { OAuthGuide } from '@/types/guide'

export const SHOWCASE_GUIDES: Record<string, OAuthGuide> = {
  github: {
    app_name: 'GitHub',
    app_domain: 'github.com',
    oauth_exists: true,
    difficulty: 1,
    difficulty_label: 'Instant',
    difficulty_reason: 'Fully self-serve with zero approval gates. You can register an OAuth App or GitHub App and immediately start authenticating users in production.',
    setup_time_minutes: 15,
    approval_wait_days_min: 0,
    approval_wait_days_max: 0,
    approval_wait_source: 'official',
    approval_required: false,
    approval_type: 'none',
    approval_triggers: [],
    oauth_flow_type: 'authorization_code',
    portal_url: 'https://github.com/settings/developers',
    prerequisites: [
      'Standard GitHub personal account or Organization membership',
      'Valid application homepage URL',
      'At least one Authorization callback URL (HTTP localhost permitted for testing)',
    ],
    steps: [
      {
        number: 1,
        title: 'Navigate to Developer Settings',
        description: 'Log into GitHub, click your profile icon in the top right, select "Settings", then scroll down the left sidebar to "Developer settings".',
        url: 'https://github.com/settings/developers',
        requires_human: true,
        human_reason: 'Requires authenticating with your personal GitHub account.',
      },
      {
        number: 2,
        title: 'Choose App Type',
        description: 'Choose between "OAuth Apps" (legacy, user-scoped tokens) or "GitHub Apps" (recommended for modern integrations, fine-grained repository permissions and bot identities).',
        requires_human: true,
        human_reason: 'Architectural decision based on whether you need repository-level or user-level access.',
      },
      {
        number: 3,
        title: 'Register New Application',
        description: 'Click "New OAuth App". Enter your Application Name, Homepage URL, and Authorization callback URL (e.g., https://yourapp.com/api/auth/callback/github or http://localhost:3000/api/auth/callback).',
        requires_human: false,
      },
      {
        number: 4,
        title: 'Generate Client Secret',
        description: 'Once created, copy the Client ID. Click "Generate a new client secret", authenticate with 2FA/sudo password, and store the secret securely in your environment variables.',
        requires_human: true,
        human_reason: 'Requires 2FA verification to view the secret.',
      },
      {
        number: 5,
        title: 'Implement Authorization Code Flow',
        description: 'Redirect users to https://github.com/login/oauth/authorize?client_id=...&scope=read:user,user:email. Exchange received code at https://github.com/login/oauth/access_token.',
        url: 'https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps',
        requires_human: false,
      },
    ],
    scopes_available: [
      { name: 'read:user', description: 'Grants read access to profile data', requires_review: false },
      { name: 'user:email', description: 'Grants read access to user primary and verified email addresses', requires_review: false },
      { name: 'repo', description: 'Grants full control to private and public repositories', requires_review: false },
      { name: 'public_repo', description: 'Limits access to public repositories only', requires_review: false },
      { name: 'gist', description: 'Grants write access to gists', requires_review: false },
    ],
    scopes_triggering_review: [],
    known_blockers: [
      'Organization third-party access restrictions (OAuth App Access Restrictions): Organization owners must explicitly approve your app if users authenticate with org-owned repositories.',
      'Tokens are bearer by default; refreshing tokens requires explicitly opting into expiring user tokens in application settings.',
      'Client secrets are only displayed once upon generation.',
    ],
    agent_verified: [
      { action: 'Inspected GitHub Developer documentation', status: 'verified', note: 'Confirmed OAuth 2.0 specs and endpoints' },
      { action: 'Verified .well-known / metadata endpoint', status: 'attempted', note: 'GitHub does not provide OIDC discovery; uses dedicated endpoints' },
      { action: 'Confirmed self-serve production credentials', status: 'verified', note: 'No human review queue exists for standard OAuth apps' },
    ],
    community_insights: [
      {
        insight: 'For AI agents operating on GitHub, prefer "GitHub Apps" over OAuth Apps. GitHub Apps support installation tokens with short 1-hour lifetimes and fine-grained per-repo scopes.',
        source_type: 'blog',
        source_url: 'https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/deciding-when-to-build-a-github-app',
      },
      {
        insight: 'Localhost redirects work immediately without SSL, making local testing frictionless compared to Google or Microsoft.',
        source_type: 'reddit',
      },
    ],
    official_sources: [
      {
        title: 'GitHub OAuth Apps Documentation',
        url: 'https://docs.github.com/en/apps/oauth-apps',
        type: 'official_docs',
      },
      {
        title: 'Authorizing OAuth Apps',
        url: 'https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps',
        type: 'official_docs',
      },
    ],
    generated_at: '2026-11-05T14:00:00.000Z',
  },

  notion: {
    app_name: 'Notion',
    app_domain: 'notion.so',
    oauth_exists: true,
    difficulty: 2,
    difficulty_label: 'Easy',
    difficulty_reason: 'Self-serve setup with a mandatory prerequisite: public integrations require a live Privacy Policy URL and Terms of Service URL, plus domain configuration.',
    setup_time_minutes: 30,
    approval_wait_days_min: 0,
    approval_wait_days_max: 0,
    approval_wait_source: 'official',
    approval_required: false,
    approval_type: 'self-serve',
    approval_triggers: ['Converting integration from Internal to Public distribution'],
    oauth_flow_type: 'authorization_code',
    portal_url: 'https://www.notion.so/profile/integrations',
    prerequisites: [
      'Notion workspace with admin or member permissions',
      'Live, publicly accessible Privacy Policy URL',
      'Live, publicly accessible Terms of Service URL',
      'Valid HTTPS redirect URI (HTTP permitted only for localhost during development)',
      'Application logo image (JPEG or PNG)',
    ],
    steps: [
      {
        number: 1,
        title: 'Navigate to My Integrations',
        description: 'Log into Notion in your browser and visit the Integrations dashboard.',
        url: 'https://www.notion.so/profile/integrations',
        requires_human: true,
        human_reason: 'Requires login to your Notion account.',
      },
      {
        number: 2,
        title: 'Create an Internal Integration First',
        description: 'Click "+ New integration". Give your integration a name, select your associated workspace, and upload an icon. This initially creates an "Internal" integration.',
        requires_human: false,
      },
      {
        number: 3,
        title: 'Switch Distribution to Public',
        description: 'Under the "Distribution" tab on the left, toggle distribution from "Internal" to "Public". Notion will ask you to confirm your company name, website, Privacy Policy, and Terms of Service.',
        requires_human: true,
        human_reason: 'Requires legal URLs and company details.',
      },
      {
        number: 4,
        title: 'Configure Redirect URIs',
        description: 'Provide your HTTPS callback URLs. For local development, Notion allows http://localhost URLs.',
        requires_human: false,
      },
      {
        number: 5,
        title: 'Retrieve OAuth Client ID and Secret',
        description: 'Under "Secrets", obtain your OAuth client_id and client_secret. Notion uses HTTP Basic Authentication when exchanging authorization codes for tokens.',
        url: 'https://developers.notion.com/docs/authorization',
        requires_human: false,
      },
    ],
    scopes_available: [
      { name: 'read_content', description: 'Read page and block content', requires_review: false },
      { name: 'insert_content', description: 'Create and append pages and blocks', requires_review: false },
      { name: 'update_content', description: 'Update page properties and content', requires_review: false },
      { name: 'read_user_info', description: 'Read user information and avatar', requires_review: false },
    ],
    scopes_triggering_review: [],
    known_blockers: [
      'Token exchange requires HTTP Basic Auth: The Authorization header must be `Basic base64(client_id:client_secret)`. Passing credentials in the POST body often fails with HTTP 401.',
      'Users must explicitly select which pages/workspaces to share during the OAuth consent popup; your integration has zero visibility into any pages outside that selection.',
      'Workspace-level duplication: If a user has multiple workspaces, they must authorize each workspace separately.',
    ],
    agent_verified: [
      { action: 'Scraped Notion API Authorization guide', status: 'verified', note: 'Verified public OAuth distribution requirements' },
      { action: 'Checked token endpoint authentication method', status: 'verified', note: 'Confirmed HTTP Basic Auth header requirement' },
      { action: 'Reviewed workspace permission picker model', status: 'verified', note: 'Notion enforces page-level user granting' },
    ],
    community_insights: [
      {
        insight: 'A very common developer bug is omitting the `owner` object in the token exchange response. Notion returns who authorized the integration and which workspace was selected.',
        source_type: 'stackoverflow',
      },
      {
        insight: 'Notion does not use refresh tokens by default for standard integrations; access tokens are long-lived (indefinite) unless explicitly revoked.',
        source_type: 'github',
      },
    ],
    official_sources: [
      {
        title: 'Notion Developer Portal - Authorization Guide',
        url: 'https://developers.notion.com/docs/authorization',
        type: 'official_docs',
      },
    ],
    generated_at: '2026-11-05T14:00:00.000Z',
  },

  slack: {
    app_name: 'Slack',
    app_domain: 'slack.com',
    oauth_exists: true,
    difficulty: 3,
    difficulty_label: 'Moderate',
    difficulty_reason: 'Direct installs via OAuth link are self-serve, but listing in the public Slack App Directory requires a formal manual review (3 to 7 business days) with strict security and UX checks.',
    setup_time_minutes: 45,
    approval_wait_days_min: 3,
    approval_wait_days_max: 7,
    approval_wait_source: 'official',
    approval_required: true,
    approval_type: 'review',
    approval_triggers: [
      'Submitting to the public Slack App Directory',
      'Distributing outside of development workspaces without direct install links',
      'Requesting Enterprise Grid admin scopes',
    ],
    oauth_flow_type: 'authorization_code',
    portal_url: 'https://api.slack.com/apps',
    prerequisites: [
      'A development Slack workspace where you have admin permissions',
      'App manifest (JSON or YAML) or manual feature configuration',
      'Public landing page with privacy policy for Directory submission',
      'Tested installation link and token revocation handling',
    ],
    steps: [
      {
        number: 1,
        title: 'Create Slack App',
        description: 'Go to api.slack.com/apps, click "Create New App", and select "from scratch" or "from an app manifest". Select your development workspace.',
        url: 'https://api.slack.com/apps',
        requires_human: true,
        human_reason: 'Requires authenticating and selecting target workspace.',
      },
      {
        number: 2,
        title: 'Configure Scopes (Bot vs User)',
        description: 'Under "OAuth & Permissions", configure scopes. In modern Slack apps (OAuth v2), you distinguish between Bot Token Scopes (actions taken as the bot) and User Token Scopes (acting on behalf of the user).',
        requires_human: false,
      },
      {
        number: 3,
        title: 'Set Redirect URLs',
        description: 'Add your OAuth callback URL under "Redirect URLs". Must be HTTPS in production; http://localhost is allowed for development.',
        requires_human: false,
      },
      {
        number: 4,
        title: 'Enable Public Distribution',
        description: 'Under "Manage Distribution", complete the checklist (add description, icon, support URL) and toggle "Activate Public Distribution" to enable installations from any workspace via the "Add to Slack" button.',
        requires_human: true,
        human_reason: 'Requires filling company support details and checking distribution settings.',
      },
      {
        number: 5,
        title: '(Optional) Submit to App Directory',
        description: 'If you want discovery in the Slack App Directory, submit for manual review. Slack reviewers test the installation, token handling, messaging, and privacy compliance.',
        requires_human: true,
        human_reason: 'Requires preparing review notes and test accounts for Slack review team.',
      },
    ],
    scopes_available: [
      { name: 'chat:write', description: 'Send messages as the app', requires_review: false },
      { name: 'channels:read', description: 'View basic information about public channels', requires_review: false },
      { name: 'channels:history', description: 'View messages and other content in public channels', requires_review: false },
      { name: 'commands', description: 'Add slash commands to workspace', requires_review: false },
      { name: 'users:read', description: 'View people in the workspace', requires_review: false },
    ],
    scopes_triggering_review: [
      'admin.* (Enterprise Grid administrative scopes)',
      'Any scope if submitting for public App Directory listing',
    ],
    known_blockers: [
      'V1 vs V2 OAuth confusion: Slack deprecated legacy workspace apps. Ensure you use `https://slack.com/oauth/v2/authorize` and endpoint `oauth.v2.access`.',
      'Direct distribution vs Directory listing: Many developers mistakenly believe they must wait for Directory approval to launch. You can distribute publicly immediately using your direct install URL.',
      'Token rotation: If enabled, refresh tokens expire if unused or if a refresh failure occurs.',
    ],
    agent_verified: [
      { action: 'Parsed Slack OAuth v2 documentation', status: 'verified', note: 'Confirmed oauth.v2.access endpoint specs' },
      { action: 'Differentiated Direct Install vs App Directory review', status: 'verified', note: 'Direct install is instant; Directory is 3-7 days' },
      { action: 'Checked App Manifest automation support', status: 'verified', note: 'Slack allows complete app creation via YAML/JSON manifest' },
    ],
    community_insights: [
      {
        insight: 'Directory review tests edge cases like workspace uninstallation and data deletion webhooks. If your app does not respond cleanly to tokens being revoked, rejection is common.',
        source_type: 'reddit',
      },
      {
        insight: 'You do NOT need App Directory approval to sell or launch your AI agent. You only need to activate Public Distribution and generate an Add to Slack button.',
        source_type: 'blog',
      },
    ],
    official_sources: [
      {
        title: 'Slack API: Installing with OAuth',
        url: 'https://api.slack.com/authentication/oauth-v2',
        type: 'official_docs',
      },
      {
        title: 'Slack App Directory Review Guidelines',
        url: 'https://api.slack.com/legacy/distributing/review-guidelines',
        type: 'official_policy',
      },
    ],
    generated_at: '2026-11-05T14:00:00.000Z',
  },

  google: {
    app_name: 'Google (Google Cloud / Workspace)',
    app_domain: 'google.com',
    oauth_exists: true,
    difficulty: 4,
    difficulty_label: 'Involved',
    difficulty_reason: 'Testing mode is limited to 100 users with unverified warning screens. Requesting sensitive scopes (e.g., Calendar, Drive) triggers human review (1–2 weeks) with screencast proof. Restricted scopes (e.g., Gmail) require an annual third-party CASA security audit ($5,000–$15,000+).',
    setup_time_minutes: 60,
    approval_wait_days_min: 7,
    approval_wait_days_max: 21,
    approval_wait_source: 'community',
    approval_required: true,
    approval_type: 'review',
    approval_triggers: [
      'Exceeding 100 test users in Testing mode',
      'Requesting sensitive scopes (Google Drive, Calendar, YouTube)',
      'Requesting restricted scopes (Gmail full access, Google Drive metadata)',
      'Displaying verified branding to external end-users without scary unverified warning',
    ],
    oauth_flow_type: 'authorization_code',
    portal_url: 'https://console.cloud.google.com/apis/credentials',
    prerequisites: [
      'Google Cloud Project with billing account setup (for production quotas)',
      'Verified domain in Google Search Console matching authorized domains',
      'Public Privacy Policy and Terms of Service hosted on the verified domain',
      'Unlisted YouTube video demonstrating the exact OAuth consent screen and how each requested scope is used in the UI',
      'Third-party CASA Tier 2/3 security assessment if requesting restricted scopes',
    ],
    steps: [
      {
        number: 1,
        title: 'Create Google Cloud Project',
        description: 'Log into Google Cloud Console and create or select a GCP project for your application.',
        url: 'https://console.cloud.google.com',
        requires_human: true,
        human_reason: 'Requires GCP account and project selection.',
      },
      {
        number: 2,
        title: 'Configure OAuth Consent Screen',
        description: 'Choose user type: "Internal" (Google Workspace users in your org only - no review needed) or "External" (any Google user - requires verification for production). Fill app name, user support email, authorized domains, and developer contact info.',
        url: 'https://console.cloud.google.com/apis/credentials/consent',
        requires_human: true,
        human_reason: 'Must input official domain and legal URLs.',
      },
      {
        number: 3,
        title: 'Select Scopes (Non-sensitive vs Sensitive vs Restricted)',
        description: 'Add the scopes your agent requires. Google categorizes every scope into non-sensitive, sensitive, and restricted.',
        requires_human: false,
      },
      {
        number: 4,
        title: 'Create Credentials',
        description: 'Navigate to "Credentials" -> "Create Credentials" -> "OAuth Client ID". Select "Web application". Add authorized JavaScript origins and authorized redirect URIs.',
        requires_human: false,
      },
      {
        number: 5,
        title: 'Submit for App Verification',
        description: 'When ready to publish, click "Publish App". Provide your justification text for each scope and provide a YouTube link demonstrating the OAuth flow and user consent experience.',
        requires_human: true,
        human_reason: 'Requires recording screencast video and submitting justifications.',
      },
    ],
    scopes_available: [
      { name: 'openid / profile / email', description: 'Basic identity information (non-sensitive)', requires_review: false },
      { name: 'https://www.googleapis.com/auth/calendar', description: 'Google Calendar read and write (sensitive)', requires_review: true },
      { name: 'https://www.googleapis.com/auth/drive.file', description: 'Create and open files created by your app only (recommended sensitive scope)', requires_review: true },
      { name: 'https://www.googleapis.com/auth/gmail.readonly', description: 'Read user emails (restricted scope - requires CASA security audit)', requires_review: true },
    ],
    scopes_triggering_review: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/gmail.*',
    ],
    known_blockers: [
      '100-user testing cap: In "Testing" mode, only users explicitly added to your Google Cloud Console user test list can log in. User #101 will receive a blocking 403 access_denied error.',
      '"Google hasn\'t verified this app" warning: Until brand verification is approved, users will see a scary red warning screen requiring them to click "Advanced" -> "Go to app (unsafe)".',
      'Domain verification requirement: You cannot submit an external app for review until the root domain is verified via Google Search Console under the same developer email.',
      'Screencast rejection: Reviewers frequently reject videos if the Google Client ID is not visibly legible in the browser address bar during the recording.',
    ],
    agent_verified: [
      { action: 'Analyzed Google Cloud OAuth Verification Policies', status: 'verified', note: 'Classified scopes into Non-sensitive, Sensitive, and Restricted' },
      { action: 'Confirmed 100-user testing cap behavior', status: 'verified', note: 'Applies to all unverified external projects' },
      { action: 'Verified CASA assessment requirement', status: 'verified', note: 'Restricted scopes mandate Tier 2/3 lab audit' },
    ],
    community_insights: [
      {
        insight: 'Official Google docs state verification takes "2-3 business days", but real-world developer experience averages 2 to 4 weeks, with 2-3 back-and-forth email rounds regarding scope justifications and screencast clarity.',
        source_type: 'reddit',
        source_url: 'https://reddit.com/r/webdev',
      },
      {
        insight: 'Tip for AI agents: Request `drive.file` instead of full `drive` if possible. `drive.file` only accesses files created by your application and triggers much faster review approval.',
        source_type: 'blog',
      },
    ],
    official_sources: [
      {
        title: 'Google Identity: OAuth 2.0 Overview',
        url: 'https://developers.google.com/identity/protocols/oauth2',
        type: 'official_docs',
      },
      {
        title: 'Google OAuth Application Verification FAQ',
        url: 'https://support.google.com/cloud/answer/9110914',
        type: 'official_policy',
      },
    ],
    generated_at: '2026-11-05T14:00:00.000Z',
  },

  salesforce: {
    app_name: 'Salesforce',
    app_domain: 'salesforce.com',
    oauth_exists: true,
    difficulty: 5,
    difficulty_label: 'Restricted',
    difficulty_reason: 'Enterprise security model. Creating a Connected App / External Client App requires Salesforce Developer Edition or Enterprise admin credentials with certificate setup. Distributing to external enterprise orgs requires Salesforce Partner Program (ISV) membership and passing the official Salesforce AppExchange Security Review ($2,550 fee + annual re-checks).',
    setup_time_minutes: 120,
    approval_wait_days_min: 28,
    approval_wait_days_max: 60,
    approval_wait_source: 'community',
    approval_required: true,
    approval_type: 'audit',
    approval_triggers: [
      'Listing on Salesforce AppExchange',
      'Distributing Managed Packages to third-party Salesforce customer orgs',
      'Commercial ISV partner agreements and multi-tenant security review',
    ],
    oauth_flow_type: 'authorization_code',
    portal_url: 'https://login.salesforce.com',
    prerequisites: [
      'Salesforce Developer Edition account or System Administrator role in a Sandbox/Production org',
      'Salesforce Partner Community / ISV account (if distributing commercially)',
      'Digital Certificate (X.509) for JWT Bearer flows or mutual TLS authentication',
      'Paid AppExchange Security Review ($2,550 standard submission fee)',
      'Burp Suite / Checkmarx automated source code scan reports',
    ],
    steps: [
      {
        number: 1,
        title: 'Access App Manager in Setup',
        description: 'Log into Salesforce as an Admin. Click the Gear icon -> Setup -> Apps -> App Manager.',
        requires_human: true,
        human_reason: 'Requires Salesforce administrator credentials.',
      },
      {
        number: 2,
        title: 'Create Connected App or External Client App',
        description: 'Click "New Connected App" (or the modern "External Client App"). Enter Connected App Name, API Name, and Contact Email.',
        requires_human: false,
      },
      {
        number: 3,
        title: 'Enable OAuth Settings',
        description: 'Check "Enable OAuth Settings". Set your Callback URL (must be HTTPS or sfdc:// for mobile). Choose required OAuth scopes (e.g., Access and manage your data `api`, Perform requests on your behalf at any time `refresh_token`).',
        requires_human: false,
      },
      {
        number: 4,
        title: 'Configure Policies & PKCE',
        description: 'Save and wait 2–10 minutes for changes to propagate across Salesforce clusters. Go to "Manage Connected Apps" to configure IP relaxation and Permitted Users policies.',
        requires_human: true,
        human_reason: 'Crucial configuration: "All users may self-authorize" vs "Admin approved users are pre-authorized".',
      },
      {
        number: 5,
        title: 'AppExchange Security Review (For Multi-Org Distribution)',
        description: 'To distribute outside your own org, package your app and submit it to the Salesforce Security Review team along with static analysis reports from Checkmarx and Chimera/Burp.',
        url: 'https://developer.salesforce.com/docs/atlas.en-us.packagingGuide.meta/packagingGuide/security_review_overview.htm',
        requires_human: true,
        human_reason: 'Requires extensive security audits, vulnerability remediations, and fee payment.',
      },
    ],
    scopes_available: [
      { name: 'api', description: 'Access and manage your data via REST, SOAP, and Bulk APIs', requires_review: false },
      { name: 'refresh_token, offline_access', description: 'Perform requests on your behalf at any time', requires_review: false },
      { name: 'full', description: 'Full access to all data and metadata', requires_review: true },
      { name: 'id', description: 'Access the identity URL service', requires_review: false },
    ],
    scopes_triggering_review: [
      'Any scope when packaged into an AppExchange listing or distributed to third-party enterprise orgs',
    ],
    known_blockers: [
      '10-minute propagation delay: After creating or updating a Connected App, Salesforce authorization servers can take 2 to 10 minutes to sync. Testing immediately will fail with `error=invalid_client_id`.',
      'Tenant Admin approval block: If an enterprise customer has their Salesforce org set to "Admin approved users are pre-authorized", an end user cannot OAuth connect until their IT admin explicitly assigns the Connected App to their profile or permission set.',
      'My Domain routing: Production uses `login.salesforce.com`, Sandboxes use `test.salesforce.com`, and custom domains (e.g., `company.my.salesforce.com`) require accurate token endpoint routing.',
    ],
    agent_verified: [
      { action: 'Reviewed Salesforce Connected App & External Client App documentation', status: 'verified', note: 'Documented modern vs legacy Connected App configurations' },
      { action: 'Confirmed 2–10 minute propagation delay nuance', status: 'verified', note: 'Known platform latency documented in developer guides' },
      { action: 'Verified AppExchange Security Review pricing and process', status: 'verified', note: 'Mandatory $2,550 submission fee and 4–8 week wait time' },
    ],
    community_insights: [
      {
        insight: 'For internal agents or machine-to-machine integrations within your own company, you do NOT need AppExchange review. Use the OAuth 2.0 JWT Bearer flow with an X.509 certificate to authenticate headlessly without human prompts.',
        source_type: 'blog',
      },
      {
        insight: 'Security Review is notoriously thorough about SOQL injection and CRUD/FLS (Field Level Security) enforcement. Expect at least one round of remediation before approval.',
        source_type: 'forum',
      },
    ],
    official_sources: [
      {
        title: 'Salesforce Help: Create a Connected App',
        url: 'https://help.salesforce.com/s/articleView?id=sf.connected_app_create.htm&type=5',
        type: 'official_docs',
      },
      {
        title: 'Salesforce ISV Security Review Guide',
        url: 'https://developer.salesforce.com/docs/atlas.en-us.packagingGuide.meta/packagingGuide/security_review_overview.htm',
        type: 'official_policy',
      },
    ],
    generated_at: '2026-11-05T14:00:00.000Z',
  },
}

export function getGuideFromLibrary(appNameOrDomain: string): OAuthGuide | null {
  const normalized = appNameOrDomain.toLowerCase().trim().replace(/https?:\/\//, '').replace(/\/.*$/, '').replace(/\.(com|so|org|net|io|co)$/, '')

  for (const [key, guide] of Object.entries(SHOWCASE_GUIDES)) {
    if (
      key === normalized ||
      guide.app_name.toLowerCase() === normalized ||
      guide.app_domain.toLowerCase().includes(normalized) ||
      normalized.includes(key)
    ) {
      return guide
    }
  }

  return null
}
