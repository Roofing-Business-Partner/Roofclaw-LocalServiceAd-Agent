# Google LSA Lead Ingestion and Sub-5-Minute SLA

This launchpad should deliver fast lead response without using `HEARTBEAT.md`.

Default recommendation:

1. **Primary trigger:** Google Ads API polling every 2 minutes.
2. **Optional accelerator:** LSA notification email wakes the Sales RoofClaw and triggers an immediate poll.
3. **Not recommended:** one-minute heartbeat loops.
4. **Not assumed:** native Google LSA webhook for every lead/message event.

## Why polling is the default

Google's lead retrieval guidance says new leads are available through the Google Ads API in near real time and can be sent into a CRM without downloading CSVs or setting up a webhook integration. Local Services lead resources expose creation time, lead type, lead status, contact details, and resource names through the Google Ads API.

For this repo, that means the Sales RoofClaw should treat Google Ads API polling as the source of truth.

Email notifications can be useful, but they are not the canonical lead record. Email can be delayed, filtered, incomplete, or only represent part of the LSA event stream. Use email as a wake signal only.

## SLA target

Target: **respond to new actionable LSA leads in under 5 minutes.**

Recommended implementation:

- Poll every 2 minutes.
- Each poll queries a rolling lookback window, not just "since last timestamp."
- Store seen lead IDs/conversation IDs locally.
- Process each new item once.
- If a poll fails, retry next interval and escalate after repeated failures.

A 2-minute poll interval gives enough margin for API/network delay, processing, HubSpot write, and first response while avoiding a noisy one-minute heartbeat.

## Required Google Ads access

The client needs:

- Google Ads account access to the LSA advertiser/customer.
- Google Ads developer token.
- OAuth refresh/access path authorized with `https://www.googleapis.com/auth/adwords`.
- Customer ID for the LSA account.
- Manager login customer ID if using an MCC/manager account.
- Confirmation that the API can retrieve `local_services_lead` rows.

## What to poll

### 1. New Local Services leads

Use `local_services_lead` for the lead record.

Recommended GAQL:

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
WHERE local_services_lead.creation_date_time DURING LAST_1_DAYS
ORDER BY local_services_lead.creation_date_time DESC
LIMIT 50
```

Use a rolling window plus a seen-ID cache. Do not depend only on a strict timestamp cursor, because account timezone, API delay, and clock drift can cause missed leads.

### 2. New Local Services lead conversations

Use `local_services_lead_conversation` to detect new customer replies/interactions appended to existing leads.

Recommended GAQL:

```sql
SELECT
  local_services_lead_conversation.resource_name,
  local_services_lead_conversation.id,
  local_services_lead_conversation.lead,
  local_services_lead_conversation.event_date_time,
  local_services_lead_conversation.conversation_channel,
  local_services_lead_conversation.participant_type,
  local_services_lead_conversation.message_details,
  local_services_lead_conversation.phone_call_details
FROM local_services_lead_conversation
WHERE local_services_lead_conversation.event_date_time DURING LAST_1_DAYS
ORDER BY local_services_lead_conversation.event_date_time DESC
LIMIT 100
```

Only act automatically on consumer-side conversation events. Advertiser-side events should be logged and de-duped, not treated as a new inbound lead.

## Processing sequence

For each new lead or new consumer conversation:

1. De-dupe using `resource_name` and/or `id`.
2. Pull enough lead/conversation detail to understand channel and intent.
3. Upsert HubSpot contact.
4. Upsert building/listing if property data is reliable.
5. Create or update the HubSpot deal.
6. Log the inbound LSA event as a HubSpot activity/note.
7. Decide first response channel:
   - LSA message reply for message leads.
   - Twilio phone call for call-back workflows when approved.
   - iMessage/SMS/email only if configured and compliant.
8. Send only an approved first response.
9. Log outbound response in HubSpot.
10. Create a follow-up task or escalate to a human.

## Responding inside LSA

Use `AppendLeadConversation` only for approved text replies to LSA leads.

Rules:

- Do not append a response until the lead is de-duped and logged.
- Do not send pricing, guarantees, appointment promises, or insurance statements unless explicit rules exist.
- If the message is ambiguous, send a safe acknowledgement and escalate.
- Always record the appended message in HubSpot.

## OpenClaw scheduling pattern

Do **not** use `HEARTBEAT.md` for fast LSA ingestion.

Use a durable scheduled job instead:

- Preferred: OpenClaw cron / scheduler job bound to the Sales RoofClaw or a persistent sales-ingestion session.
- Fallback: OS-level launchd/systemd timer that runs the poller script.
- Optional accelerator: inbound email notification triggers a one-shot immediate poll.

Recommended schedule:

```text
Every 2 minutes, business-hours or 24/7 depending on the company policy.
```

Recommended job behavior:

- Run one poll cycle.
- Exit cleanly.
- Never sleep forever inside the script.
- Use a lock file to prevent overlapping polls.
- Write a compact local state file of seen IDs.
- Escalate if 3 consecutive poll cycles fail.

## Email-trigger accelerator

If the LSA account sends email notifications, add the Sales RoofClaw's monitored email address as a notification recipient **only as an accelerator**.

When an LSA email arrives:

1. Do not parse it as source of truth.
2. Trigger the LSA poller immediately.
3. Let the Google Ads API result drive HubSpot and response actions.
4. If the API does not show the lead yet, retry in 60 seconds up to 3 times, then escalate.

This gives webhook-like responsiveness without trusting email as the system of record.

## Failure handling

Escalate to the owner/team if:

- Three consecutive polls fail.
- Google Ads auth expires.
- Developer token is rejected.
- No leads are returned for a known-active LSA account during testing.
- HubSpot writes fail.
- The Sales RoofClaw cannot determine if a lead was already handled.
- A response was sent but HubSpot logging failed.

## Live readiness checklist

Before promising sub-5-minute response:

- [ ] Google Ads API returns `local_services_lead` rows.
- [ ] Poller runs every 2 minutes outside `HEARTBEAT.md`.
- [ ] Seen-ID state persists across restarts.
- [ ] HubSpot contact/building/deal mapping works.
- [ ] LSA first response script is approved.
- [ ] AppendLeadConversation test is complete for message leads.
- [ ] Twilio phone test is complete if phone callback is enabled.
- [ ] Human escalation works.
- [ ] First 10 real leads are human-reviewed.
