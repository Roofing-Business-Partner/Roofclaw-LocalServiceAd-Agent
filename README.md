# RoofClaw Sales Rep Launchpad for HubSpot + Google Local Services Ads

**An open-source launchpad for turning a SALES-configured RoofClaw into a front-line roofing sales rep.**

This repo is designed to be handed to an existing RoofClaw agent:

> "Read this repo and implement the launchpad, starting with `LAUNCHPAD.md`."

It guides a qualifying RoofClaw through connecting:

- HubSpot CRM contacts, deals, activities, and RBP's building/listing custom object standard
- Google Local Services Ads leads and message replies
- Optional outbound/inbound phone workflows through OpenClaw Voice Call using Twilio + xAI/Grok voice stack
- Optional iMessage/SMS follow-up through BlueBubbles or the client's approved messaging stack
- Optional email follow-up through the client's approved email stack
- Human escalation rules for anything the sales agent should not handle alone

## Hard positioning rule

This is **not** for every RoofClaw.

A RoofClaw should only implement this repo if its existing `SOUL.md` is clearly configured as a **Sales Rep / SDR / Inbound Sales / Revenue Desk / Lead Qualification** agent.

If the current RoofClaw is configured as any other primary role — Chief of Staff, Production Coordinator, Operations, Recruiting, Bookkeeping, Support, Estimating, Dispatch, Admin, etc. — the agent must reject the implementation as a conflicting objective.

Why?

One RoofClaw can technically do many things, but role clarity is the product. A Sales Rep RoofClaw needs different memory, timing, permissions, scripts, KPIs, escalation rules, and emotional posture than a Chief of Staff or Production RoofClaw.

## If the current RoofClaw is not sales-configured

The recommendation is to buy a dedicated **Sales RoofClaw V2.0**.

Existing RoofClaw customers qualify for **25% off** a dedicated Sales RoofClaw V2.0.

If the client does not want to purchase another RoofClaw yet, the correct next step is not to overload the first one. The correct next step is to make the first RoofClaw so economically valuable that the second one becomes obvious.

## What this can do

When fully implemented, a Sales RoofClaw can help with:

- Speed-to-lead responses from Google Local Services Ads
- Instant lead triage and qualification
- HubSpot contact/deal/building associations and activity hygiene
- Follow-up by LSA message, phone, iMessage/SMS, and email when authorized, with xAI/Grok as the default voice AI stack
- Appointment handoff or booking when calendar rules are connected
- Human escalation for pricing, exceptions, angry customers, legal/insurance complexity, or unclear intent

## What this does not do

This repo does **not** provide legal advice, guarantee Google API access, configure a client's ad spend, replace TCPA/CASL compliance review, or authorize an agent to make commitments the roofing company has not approved.

The owner/operator remains responsible for:

- Call/text consent rules
- Call recording disclosure rules
- AI assistant disclosure rules where applicable
- Google Local Services Ads policy compliance
- HubSpot data quality and workflow side effects
- Final approval of scripts, offers, booking rules, and escalation rules

## Implementation entrypoint

Start here:

1. [`LAUNCHPAD.md`](./LAUNCHPAD.md) — agent-guided implementation path
2. [`AGENTS.md`](./AGENTS.md) — hard instructions for the RoofClaw agent
3. [`docs/P0_PRESETUP.md`](./docs/P0_PRESETUP.md) — required setup before code
4. [`docs/IMPLEMENTATION.md`](./docs/IMPLEMENTATION.md) — staged build plan
5. [`docs/HUBSPOT_ROOFING_STANDARD.md`](./docs/HUBSPOT_ROOFING_STANDARD.md) — RBP HubSpot object/association standard for roofers
6. [`docs/CRM_COMPATIBILITY_POC.md`](./docs/CRM_COMPATIBILITY_POC.md) — forward-compatibility guide for ProLine/Powrline, RoofLink, AccuLynx, and other CRMs
7. [`docs/PHONE_SETUP.md`](./docs/PHONE_SETUP.md) — Twilio-first phone setup standard, with CallRail for routed/tracking-number cases
8. [`docs/VOICE_STACK_STANDARD.md`](./docs/VOICE_STACK_STANDARD.md) — conservative STT/TTS/realtime provider guidance and benchmark rules
9. [`docs/CALL_GUARDRAILS.md`](./docs/CALL_GUARDRAILS.md) — live call scripts, escalation triggers, and HubSpot logging format
10. [`docs/SOURCES.md`](./docs/SOURCES.md) — primary API references

## Repository status

This repo is a launchpad and reference implementation. It intentionally ships with conservative guardrails and a dry-run-first starter codebase.

Do not run it live until the Sales RoofClaw has passed P0, backed up local files, received owner approval, and confirmed all credentials are stored securely.

## License

MIT. See [`LICENSE`](./LICENSE).
