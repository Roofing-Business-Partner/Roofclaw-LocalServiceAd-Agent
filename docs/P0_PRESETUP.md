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

This repo assumes the RBP HubSpot roofing standard. Read `docs/HUBSPOT_ROOFING_STANDARD.md` before implementation.

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

Also confirm or discover:

- Custom object internal name for Building/Listing.
- Contact ↔ Building/Listing association behavior.
- Building/Listing ↔ Deal association behavior.
- Which activity objects should be used for LSA messages, calls, texts, emails, and tasks.
- Whether custom properties for LSA lead ID/resource name already exist or need owner-approved creation.

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

Read `docs/PHONE_SETUP.md`, `docs/VOICE_STACK_STANDARD.md`, and `docs/CALL_GUARDRAILS.md` before enabling calls.

Do not enable these until HubSpot and LSA are stable.

Phone/voice standard:

- Twilio is the default OpenClaw Voice Call provider.
- CallRail is recommended when the customer needs routed numbers, marketing attribution, call tracking, or LSA/office-number complexity.
- xAI/Grok is the default cascaded voice AI stack: STT → LLM → TTS.
- Grok Voice Think Fast is an upcoming/advanced direct realtime path, not the normal customer self-setup path yet.
- Mock mode is required before live calls.

Possible channels:

- OpenClaw Voice Call plugin through Twilio
- xAI/Grok STT, LLM, and TTS
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
