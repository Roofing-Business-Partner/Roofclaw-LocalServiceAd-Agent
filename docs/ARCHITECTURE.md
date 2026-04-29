# Architecture

## Core idea

A Sales RoofClaw should behave like a fast, disciplined sales desk:

1. Detect lead.
2. Respond quickly.
3. Qualify need.
4. Create/update CRM record.
5. Book or hand off.
6. Escalate anything risky.
7. Keep HubSpot clean.

## Recommended flow

```text
Google LSA Lead
  -> Sales RoofClaw reads lead/conversation
  -> HubSpot contact upsert
  -> HubSpot deal create/update
  -> Approved first response via LSA append conversation
  -> Optional phone/text/email follow-up
  -> Human escalation if needed
  -> HubSpot notes/tasks updated
```

## HubSpot as source of truth

HubSpot should hold:

- Contact identity
- Deal/opportunity status
- Lead source
- Last touch
- Next step
- Owner/handoff
- Notes from agent interactions

## LSA as lead and first-response source

Google Local Services Ads lead records are mostly read-oriented. The useful write path is appending a text conversation to a Local Services lead.

Do not assume the API can fully manage every LSA UI action. Treat lead status, call data, and conversation history conservatively.

## Phone / iMessage / email as follow-up channels

Only use these after the owner defines compliance and script rules.

Phone is powerful, but risky. Text is powerful, but consent-sensitive. Email is easier, but slower. The agent should default to safe first-response and escalation until the business rules are clear.
