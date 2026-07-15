# Unified Audit Platform — Execution Plan

Scope is large enough that doing it in a single write pass would introduce bugs (multiple migrations require your approval one at a time, and several features depend on schema changes landing first). I'll ship it in **6 sequenced phases**, each independently verifiable.

---

## Phase 1 — Data model foundation (migration)

New tables + columns to unlock everything downstream:

- `engagements` view (or `engagement_type` union) — unified projection over `vapt_requests`, `pci_dss_requests`, `audit_requests` so `/audits/my` and admin can query one source.
- `engagement_status` enum: `requested → scoping → testing → draft → issued → revoked`. Add `status_stage` column to the three request tables (default derived from existing `status`).
- `engagement_messages` — id, engagement_id, engagement_type, sender_id, body, attachment_path, created_at. RLS: owner + admin.
- `engagement_documents` — id, engagement_id, engagement_type, kind (`engagement_letter`, `scope_confirmation`, `report`, `retest`), version, storage_path, hash, issued_at.
- `report_findings` — id, report_id, severity (`critical|high|medium|low|info`), cvss_score numeric, title, description, remediation, status (`open|remediated|risk_accepted`), retest_evidence_path.
- `report_versions` — id, report_id, version_no, kind (`initial|retest|delta`), storage_path, hash, issued_at, notes.
- `admin_action_log` — actor_id, action, entity_type, entity_id, reason, metadata jsonb, created_at.
- `invoices` — id, payment_id, engagement_id, engagement_type, number, amount, currency, pdf_path, issued_at.
- `renewal_reminders` — id, engagement_id, engagement_type, due_at, kind (`30d|60d|90d`), sent_at.
- `download_counters` — user_id/ip, verification_code, count, last_at (for anomaly detection).
- `verification_attempts` — add index on `(verification_code, created_at)` for per-code rate limiting.

Full GRANTs + RLS in the migration. Nothing else in this phase.

## Phase 2 — Client dashboard unification

- New `/audits/my` becomes the single "My reports" hub, querying the unified projection. Old `/vapt/dashboard` becomes a thin redirect + product-scoped filter.
- **Status timeline** component: horizontal stepper reflecting `status_stage`, with revoked as a terminal red state.
- **Engagement thread**: per-engagement page `/audits/my/:type/:id` with in-app messaging, file uploads to `attachments` bucket (private, RLS-scoped), and a documents tab listing engagement letter / scope confirmation / report versions.
- Engagement letter + scope confirmation download surfaces once admin uploads them (Phase 3).

## Phase 3 — Admin console unification

- New `/admin/queue` — single sortable/filterable table (type, status, assignee, company, date). Existing three admin pages become filtered links into it.
- **Findings tracker** UI on the engagement detail page: add/edit findings with severity + CVSS, retest evidence upload, status transitions.
- **Report versioning**: "Issue new version" flow → creates row in `report_versions`, marks previous as superseded, notifies client.
- **Bulk revoke** modal with mandatory reason → writes `admin_action_log` + notifications for each affected client.
- Every admin mutation writes to `admin_action_log`; a "History" tab surfaces it.

## Phase 4 — Report generation overhaul

- New edge function `generate-report-v2` using a single React/HTML → PDF template with variants (`vapt|pci_dss|audit`). Deno + `puppeteer`-compatible renderer or `@react-pdf/renderer` via `npm:`.
- Every page footer: verification QR (links to `/verify-report/<code>`) + SHA-256 hash of the report body (tamper-evident).
- **AI-drafted executive summary**: edge function calls Lovable AI Gateway with the findings list; admin edits before issue.
- Old `generate-report` kept as fallback for one release, then removed.

## Phase 5 — Payments, lifecycle, security hygiene

- `paystack-verify` extended: on success, generate invoice PDF, insert into `invoices`, email link.
- Cron job (pg_cron + pg_net) daily: enqueues `renewal_reminders` at 90/60/30 days before report expiry, dispatches via `send-renewal-reminder` edge function.
- `verify-report` gains per-code rate limit (5/min/code) alongside existing per-IP limit.
- `public-report-download` increments `download_counters`; admin can flag anomalies (>N downloads/hour).

## Phase 6 — SEO / public pages

- Real content pages: `/audits/soc-2`, `/audits/iso-27001`, `/audits/pci-dss`, `/audits/hipaa` — each with hero, scope, methodology, deliverables, case study slot, FAQ.
- JSON-LD `Service` + `Organization` blocks via `Seo` component.
- Sitemap + `llms.txt` updated.

---

## Technical notes

- Unified projection: prefer a Postgres `VIEW` (`public.engagements_v`) that `UNION ALL`s the three request tables with a `type` discriminator column. Client queries the view; RLS enforced on underlying tables via `security_invoker=on`.
- Storage: reuse `reports` (private) + `attachments` (private) buckets. Add path convention `engagement/<type>/<id>/...`.
- Notifications: reuse existing `notifications` table for revoke/version/reminder events.
- PDF renderer: `@react-pdf/renderer` is the cleanest fit for edge — no headless browser needed.

## What I need from you now

Approve this plan and I'll start with **Phase 1 (the migration)** — you'll get a review prompt for the SQL. Once that lands, phases 2–6 each become 1–2 focused turns.

If you'd rather narrow scope (e.g. skip Phase 4 AI drafting, or defer Phase 6 SEO), tell me which phases to drop before I start.
