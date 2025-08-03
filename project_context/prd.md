1. Product Overview & Vision
Product: AdCopy Web App
 Problem: Marketers waste hours crafting channel-specific copy for Google Ads, Instagram posts, Facebook ads, email campaigns, etc., often juggling inconsistent brand guidelines and disjointed tools.
 Solution: An AI-powered web application offering “agent” specialists for each marketing channel. Through an interactive Q&A flow enriched by the user’s own knowledge base, agents generate on-brand copy drafts, archive full histories, and let admins customize templates.
 Target Users:
In-house marketing managers


Small-to-mid sized agency specialists


Solo entrepreneurs needing fast, consistent ad copy
 Vision (12 months): Empower every marketer—regardless of writing skill—to spin up best-practice, on-brand ad copy in under 5 minutes per channel, while maintaining complete audit trails and customizable templates.


2. Market Analysis & User Personas
Market Context
Growth of AI in marketing: 30% CAGR in AI-driven marketing tools


Pain point: 60% of SMBs lack dedicated copywriters


Opportunity: Bridge generic LLM outputs and custom brand guidelines




Primary Personas
Persona
Role & Needs
Marketing Manager
Works across channels; needs consistent tone, quick iterations, version control.
Social Media Specialist
Creates dozens of posts weekly; needs channel-optimized formats and batch workflows.
Agency Owner
Manages multiple clients; needs per-client brand libraries, team permissions, and usage metrics.


3. Business Objectives & Success Metrics
Objective
Target Metric
Speed up copy creation
Time per draft < 5 minutes (vs. 20 minutes baseline)
Drive adoption among SMBs
500 DAU within 3 months
Ensure brand consistency
≥ 90% user satisfaction on “brand fit” survey
Monetization (Phase 2)
Convert 10% of MAU to paid plans within 6 months

North-star Metric: # of approved drafts per week per user
 Guardrails:
Response latency ≤ 30 s


Uptime ≥ 99.5%


Conversation error rate < 1%




4. Functional Requirements
4.1 Core Features (MVP)
Personal Knowledge Base


Upload & index user files (PDF, text, images, transcripts)


Ensure context-rich, brand-aligned outputs


Upload Capability


Accept PDF/text/image/video files


Parse via Tika/Textract into searchable KB chunks


Agent-Based Copy Generation


Pre-built specialists (Google Ads, Instagram, Facebook, Email)


Template-driven prompts, customizable by admins


Interactive Prompt Flow


Dynamic Q&A for required placeholders


Enforce completeness before generation


Conversation History & Archiving


Store every message and status per conversation


Searchable history panel with filters


Prompt Editor (Admin-Level)


CRUD on agent prompt templates & versioning


Deploy per-org or per-user instances


Basic Brand Customization


Tone profile, color scheme, logo in UI & prompts



5. Data Model
Entity
Key Attributes
User
id, name, email, role_id, org_id, avatar_url, created_at
Role
id, name (admin/editor/viewer)
Organization
id, name, brand_settings_id
BrandSettings
id, org_id, tone_profile, color_scheme, logo_url
AgentTemplate
id, name, description, template_body, created_by, created_at
AgentInstance
id, agent_template_id, owner_user_id, visibility, config_json, created_at
Conversation
id, agent_instance_id, user_id, title, status, started_at
Message
id, conversation_id, sender_type (user/ai), content, created_at
KBItem
id, owner_user_id, type, title, metadata_json, status, uploaded_at
KBContent
id, kb_item_id, chunk_index, content_excerpt, created_at
Integration
id, org_id, type, credentials_json, enabled
APIKey
id, integration_id, label, encrypted_value, created_at


6. Integrations & External Services
n8n (Hostinger VPS)


Webhook orchestrator for all business logic


Credentials stored & rotated in n8n


AI Models: OpenAI Chat & Embeddings (router-ready for Claude/Qwen)


Auth: Supabase Auth (Google OAuth + email/password)


DB: Postgres (Supabase-managed or on VPS) with optional pgvector


Storage: VPS filesystem + optional Cloudflare CDN


File Parsing: Apache Tika (self-hosted) / AWS Textract


Email: SendGrid via n8n


Analytics: PostHog server-side events


Error Monitoring: Sentry (UI & workflows)



7. Technical Constraints & Dependencies
Frontend: Next.js (App Router) + TypeScript + shadcn/ui


Backend: n8n Docker on VPS, JWT verification node in every workflow


Database: Postgres 14+, pgvector extension installable later


Storage: Non-executable upload dir, nightly offsite backups


Auth: JWT issued by Supabase, verified in n8n


CI/CD: GitHub Actions → Docker Compose deploy


IaC: Docker Compose for MVP; Terraform planned later


Scale Guardrails:


Max tokens/request: 8 k


KB cap/user: 500 MB; per-file max 50 MB


Sync response ≤ 30 s, else async job


8. UI/UX Requirements
Design System: shadcn/ui + Tailwind


Layouts: Dashboard, Agent Catalog, Chat Panel, KB Library, Settings


Responsive: Desktop & tablet; mobile minimum support


Accessibility: WCAG 2.1 AA; keyboard nav, ARIA labels


Internationalization: UI strings externalized; date/number per user locale



9. Release Criteria & 15-Day Timeline
Phase
Deliverables
Days
Setup & Scaffolding
Next.js + n8n + DB schema + auth
1–2
Core UI Flows
Dashboard, auth, agent catalog
3–5
Chat & Agent.run
Chat UI, /api/agent.run workflow, storage
6–8
KB Ingestion
Upload UI, /api/kb.ingest workflow
9–10
Admin UI
Prompt editor, brand settings
11–12
Polish & QA
Sentry, PostHog, styling, bugfixes
13–14
Deploy & Test
Production deploy, performance checks
15

Release Criteria (Beta):
All core flows functional end-to-end


No critical bugs; error rate < 1%


Performance: 90% of requests < 3 s



10. Risks & Mitigation Strategies
Risk
Mitigation
Solo developer, tight timeline
Strict scope; mock non-critical features; daily check-ins
LLM rate limits / errors
n8n retry/backoff; throttle per org/user
File parsing failures
Fallback to manual upload; catch & notify errors
Data leakage across tenants
Tenant filters on every query; JWT enforcement
VPS performance constraints
Monitor, scale to managed DB/CDN if needed


11. End-to-End User Flows (with n8n)
Note: Each flow lists UI action → n8n webhook → workflow steps → UI feedback.
I. Authentication & Account
Sign In (Email/Password)


UI: Login form → “Sign In”


Webhook: POST /api/auth.login


Workflow: Verify creds → issue JWT


Feedback: Redirect to dashboard


Sign In (OAuth)


UI: “Sign in with Google”


Webhook: POST /api/auth.oauth


Workflow: Exchange code → validate → upsert User → issue JWT


Feedback: Redirect to dashboard


Refresh JWT


UI: Silent client call


Webhook: POST /api/auth.refresh


Workflow: Validate refresh token → issue new JWT


Feedback: (None visible)


Sign Out


UI: “Logout”


Client: Clear JWT, redirect


Feedback: Login screen


View / Edit Profile


UI: Profile page → edit → Save


Webhooks:


GET /api/user.profile


POST /api/user.profile


Workflow: Fetch/update user row; upload avatar → URL


Feedback: Updated info & image


Change Password / 2FA


UI: Settings → Security → actions


Webhooks:


POST /api/user.changePwd


POST /api/user.enable2fa


Workflow: Verify → update hash/flags


Feedback: Success/error toast



III. Agent & Prompt Management
View Available Agents


UI: Agent catalog


Webhook: GET /api/agents.list


Workflow: Query AgentInstance + versions


Feedback: Agent cards


Edit Agent’s Prompt


UI: Agent → “Edit Prompt” → Save


Webhook: POST /api/prompt.update


Workflow: Validate role → insert agent_versions → activate


Feedback: Toast + version history



IV. Knowledge Base Management
Upload File


UI: KB → Upload → Submit


Action: Save to /uploads/... → return path


Webhook: POST /api/kb.ingest


Workflow: Upsert kb_items → parse → chunk → (opt) embed → update status


Feedback: Badge flips “Uploaded” → “Indexed”

List KB Items


UI: KB → Files


Webhook: GET /api/kb.list?user_id=…


Workflow: Query by user_id


Feedback: Paginated list


Preview / Download File


UI: Click file


Action: Signed URL or CDN link


Feedback: Preview/download


Delete KB Item


UI: File → Delete → Confirm


Webhook: DELETE /api/kb.delete?id=…
Workflow: Soft-delete + cascade
Feedback: Removed + “Undo” toast


V. Conversations & Copy Generation
Start New Conversation


UI: “New Chat” → select agent


Webhook: POST /api/agent.run (no convo_id)


Workflow: Auth → fetch agent → (opt) KB retrieve → call OpenAI → insert convo & messages → usage metrics


Feedback: Chat opens with first AI prompt


Continue Conversation


UI: Type → Send


Webhook: POST /api/agent.run (with convo_id)


Workflow: Load convo + last K turns → generate → insert AI message → metrics


Feedback: AI reply appended


Handle Missing Fields


UI: Form for missing inputs


Webhook: POST /api/agent.run


Workflow: Compare inputs vs placeholders → if missing → 422 + missing_fields


Feedback: Questions rendered


Regenerate Last Message


UI: “Regenerate”


Webhook: POST /api/agent.run


Workflow: Repeat generate → insert new AI message


Feedback: New reply


VI. Conversation Management
List Conversations


UI: Conversation list


Webhook: GET /api/conversation.list?user_id…


Workflow: Query conversations + summary


Feedback: Paginated list


Open Conversation


UI: Click convo


Webhook: GET /api/conversation.get?id=…


Workflow: Fetch messages


Feedback: Full transcript


Rename Conversation


UI: Edit title → Save


Webhook: POST /api/conversation.rename


Workflow: Update title


Feedback: Inline update


Delete (Archive) Conversation


UI: Delete → Confirm


Webhook: DELETE /api/conversation?id=…


Workflow: Soft-delete


Feedback: Removed + “Undo” toast



VII. Media Library (Links & Transcripts)
Switch to “Links” Tab


UI: Click “Links”


Feedback: Links view


Add Link


UI: + Add Link → Submit


Webhook: POST /api/kb.linkAdd


Workflow: Fetch metadata → insert kb_items(type='link')


Feedback: Link list update


Switch to “Transcripts” Tab


UI: Click “Transcripts”


Feedback: Transcript view


Add Transcript (YouTube)


UI: + Add Transcript → Submit


Webhook: POST /api/kb.ytIngest


Workflow: Fetch captions → insert kb_items(type='transcript') + chunks


Feedback: Indexed transcript item



VIII. Settings & Configuration
Update Brand Voice


UI: Settings → Brand → Save


Webhook: POST /api/org.brandUpd


Workflow: Update BrandSettings


Feedback: Live preview


Change Model & Params


UI: Settings → Model & Params → Save


Webhook: POST /api/org.modelUpd


Workflow: Update org_settings


Feedback: Applied next run


View Usage & Limits


UI: Usage Dashboard


Webhook: GET /api/usage.orgMonth


Workflow: Aggregate usage


Feedback: Charts/tables


Set Quotas


UI: Edit Limits → Save


Webhook: POST /api/org.limits


Workflow: Upsert org_limits


Feedback: New badges & enforcement
