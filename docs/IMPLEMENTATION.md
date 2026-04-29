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

## Stage 2 — HubSpot standard mapping

Read `docs/HUBSPOT_ROOFING_STANDARD.md`. Confirm the target portal has or can support:

- Contact as person record
- Building/Listing custom object as physical property record
- Deal as opportunity record
- Activity objects for notes/calls/emails/communications/tasks
- Associations between contact, building/listing, deal, and activities

If the client is not on HubSpot, stop and complete `docs/CRM_COMPATIBILITY_POC.md` before adapting the implementation.

## Stage 3 — HubSpot dry run

Use `src/examples/dry-run-lead-to-hubspot.mjs` with the sample fixture:

```bash
node src/examples/dry-run-lead-to-hubspot.mjs fixtures/sample-lsa-lead.json
```

Review the contact and deal payloads. Confirm:

- Contact name/phone/email mapping
- Building/listing property mapping when address exists
- Lead source
- Deal name format
- Pipeline and stage
- Custom properties to use or omit

## Stage 4 — HubSpot write test

Only after dry-run review:

```bash
ROOFCLAW_SALES_LIVE_MODE=true node src/examples/dry-run-lead-to-hubspot.mjs fixtures/sample-lsa-lead.json --execute
```

Verify the test contact/deal in HubSpot.

## Stage 5 — LSA ingestion setup

Read `docs/GOOGLE_LSA_INGESTION.md`. Configure a durable scheduled poller outside `HEARTBEAT.md`. The default SLA design is a 2-minute Google Ads API poll with optional email-triggered immediate poll.

Test the starter read-only poller:

```bash
node src/lsa/poll-new-leads.mjs
```

Do not enable live responses until polling, de-duplication, HubSpot logging, and escalation are verified.

## Stage 6 — LSA read-only test

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

## Stage 7 — LSA append test

With owner approval, append one safe test response to one test/low-risk lead:

```js
await appendLeadConversation({
  customerId: process.env.GOOGLE_ADS_CUSTOMER_ID,
  leadResourceName: 'customers/1234567890/localServicesLead/987654321',
  text: 'Thanks for reaching out — we received your request and will follow up shortly.'
})
```

Then verify in the LSA inbox.

## Stage 8 — Channel expansion

Add one channel at a time:

1. LSA text reply
2. HubSpot note/task logging
3. Email follow-up
4. iMessage/SMS follow-up
5. Phone call follow-up only after `docs/PHONE_SETUP.md` and `docs/CALL_GUARDRAILS.md` pass mock-mode testing

Each channel needs:

- Approved script
- Rate limits
- Consent/compliance rule
- Human escalation path
- Dry-run/test/live switch

## Stage 9 — Live mode

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
