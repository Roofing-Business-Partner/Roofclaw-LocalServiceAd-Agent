# Implementation Plan

This is a staged build. Do not skip stages.

## Stage 0 — Soul gate

- Read `SOUL.md`.
- Classify the RoofClaw as `SALES_REP`, `NON_SALES`, or `BORDERLINE`.
- Reject anything except `SALES_REP`.

## Stage 1 — Backups

Back up local agent files before changes:

- `SOUL.md`
- `IDENTITY.md`
- `TOOLS.md`
- `HEARTBEAT.md`
- config files
- existing scripts/skills touched by this install

Use recoverable copy operations. Do not delete or overwrite originals without backup.

## Stage 2 — HubSpot dry run

Use `src/examples/dry-run-lead-to-hubspot.mjs` with the sample fixture:

```bash
node src/examples/dry-run-lead-to-hubspot.mjs fixtures/sample-lsa-lead.json
```

Review the contact and deal payloads. Confirm:

- Contact name/phone/email mapping
- Lead source
- Deal name format
- Pipeline and stage
- Custom properties to use or omit

## Stage 3 — HubSpot write test

Only after dry-run review:

```bash
ROOFCLAW_SALES_LIVE_MODE=true node src/examples/dry-run-lead-to-hubspot.mjs fixtures/sample-lsa-lead.json --execute
```

Verify the test contact/deal in HubSpot.

## Stage 4 — LSA read-only test

Use Google Ads API search in read-only mode to retrieve recent Local Services leads.

Recommended GAQL starting point:

```sql
SELECT
  local_services_lead.resource_name,
  local_services_lead.id,
  local_services_lead.creation_date_time,
  local_services_lead.lead_type,
  local_services_lead.lead_status,
  local_services_lead.category_id,
  local_services_lead.service_id,
  local_services_lead.contact_details
FROM local_services_lead
WHERE local_services_lead.creation_date_time DURING LAST_7_DAYS
ORDER BY local_services_lead.creation_date_time DESC
LIMIT 20
```

If fields fail, inspect Google Ads field metadata for the client's API version and adjust. Do not guess live.

## Stage 5 — LSA append test

With owner approval, append one safe test response to one test/low-risk lead:

```js
await appendLeadConversation({
  customerId: process.env.GOOGLE_ADS_CUSTOMER_ID,
  leadResourceName: 'customers/1234567890/localServicesLeads/987654321',
  text: 'Thanks for reaching out — we received your request and will follow up shortly.'
})
```

Then verify in the LSA inbox.

## Stage 6 — Channel expansion

Add one channel at a time:

1. LSA text reply
2. HubSpot note/task logging
3. Email follow-up
4. iMessage/SMS follow-up
5. Phone call follow-up

Each channel needs:

- Approved script
- Rate limits
- Consent/compliance rule
- Human escalation path
- Dry-run/test/live switch

## Stage 7 — Live mode

Only enable live mode after:

- First 10 test actions are reviewed.
- Owner signs off.
- Escalation works.
- There is a rollback plan.

Start with narrow scope:

- Business hours only
- New LSA message leads only
- One first-response message only
- Human handles complex follow-up

Expand once behavior is proven.
