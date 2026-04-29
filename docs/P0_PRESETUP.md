# P0 Pre-Setup Guide

Complete this before implementing anything.

## 1. Confirm agent fit

Run or manually perform the soul gate:

```bash
node scripts/preflight/soul-purpose-check.mjs /path/to/SOUL.md
```

If the result is not `SALES_REP`, stop.

## 2. Confirm business authorization

The owner must confirm:

- This RoofClaw may respond to new sales leads.
- This RoofClaw may update HubSpot.
- This RoofClaw may append messages to LSA leads when approved.
- This RoofClaw may call/text/email leads only under approved rules.
- A human escalation contact exists.

## 3. HubSpot requirements

Create or use a HubSpot Private App.

Recommended minimum scopes:

- `crm.objects.contacts.read`
- `crm.objects.contacts.write`
- `crm.objects.companies.read`
- `crm.objects.companies.write`
- `crm.objects.deals.read`
- `crm.objects.deals.write`
- `crm.objects.calls.read`
- `crm.objects.calls.write`
- `crm.objects.notes.read`
- `crm.objects.notes.write`
- `crm.pipelines.deals.read`
- `crm.schemas.contacts.read`
- `crm.schemas.deals.read`

Confirm which pipeline and deal stage should receive new LSA opportunities.

## 4. Google Local Services Ads requirements

The client needs access to the Google Ads account that owns the Local Services Ads leads.

Required pieces typically include:

- Google Ads customer ID
- Manager account login customer ID if applicable
- Google Ads developer token
- OAuth client + refresh token authorized with `https://www.googleapis.com/auth/adwords`
- Confirmation that Local Services Ads leads are available in that account

The Google Ads API exposes Local Services lead data, and the Local Services Lead Service includes an `AppendLeadConversation` method for adding text conversations to leads.

## 5. Phone / text / iMessage requirements

Do not enable these until HubSpot and LSA are stable.

Possible channels:

- OpenClaw Voice Call plugin through Twilio, Telnyx, or Plivo
- BlueBubbles for iMessage on macOS
- Client-approved SMS provider
- Client-approved email provider

Define compliance rules before use:

- AI disclosure
- Call recording disclosure
- Consent for texts/SMS
- Do-not-contact handling
- Hours of operation
- Escalation triggers

## 6. Approved scripts

Create owner-approved scripts for:

- First response
- Qualification questions
- Appointment handoff
- Missed-call recovery
- No-response follow-up
- Human escalation
- Stop / unsubscribe / wrong-number handling

## 7. Dry-run environment

Create `.env` from `.env.example` and leave `ROOFCLAW_SALES_LIVE_MODE=false` until owner approves live mode.
