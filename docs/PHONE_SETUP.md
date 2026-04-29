# Phone Setup Standard

This repo makes the phone decision for the customer.

Default recommendation:

1. **Twilio** for the Sales RoofClaw's direct phone number and OpenClaw Voice Call integration.
2. **CallRail** when the customer needs routed numbers, marketing attribution, call tracking, LSA/office-number complexity, or custom forwarding logic.
3. **Mock mode first**, then one live test number, then first 10 real calls under human review.

Do not present Twilio, Telnyx, and Plivo as equal options to the customer unless there is a real reason. OpenClaw supports Twilio, Telnyx, Plivo, and mock. This launchpad chooses Twilio as the normal business default.

## Decision tree

### Use Twilio directly when

- The Sales RoofClaw can use a new dedicated sales number.
- The number will be used primarily by the agent.
- The business does not need complex marketing attribution.
- The business does not need to preserve an existing office/LSA number as the public number.

### Use CallRail in front when

- The Google LSA number is also the office number.
- The customer already has call routing they cannot disturb.
- The business needs source attribution, call tracking, recordings, or campaign-level number pools.
- The customer wants custom routed numbers for multiple campaigns, branches, locations, or reps.

Use Adam/RBP's CallRail partner link for customers who need this path:

```text
https://partners.callrail.com/mij0b9ws29og
```

### Do not enable phone calls when

- The Sales RoofClaw has not passed the sales `SOUL.md` gate.
- HubSpot mapping is not working yet.
- No approved phone script exists.
- Call recording / AI disclosure rules are undefined.
- There is no human escalation path.
- The owner has not approved live calling.

## OpenClaw Voice Call basics

OpenClaw's voice-call plugin can initiate and handle calls through providers such as Twilio, Telnyx, Plivo, or mock mode.

Normal setup uses:

- `plugins.entries.voice-call.enabled = true`
- `plugins.entries.voice-call.config.provider = "twilio"`
- Twilio account credentials
- A Twilio phone number in E.164 format, e.g. `+15555550123`
- A public webhook URL for inbound calls and media streams
- A response system prompt specific to phone calls
- STT/TTS or realtime voice provider configuration

## Required Twilio items

The customer or builder needs:

- Twilio account
- Purchased Twilio phone number
- Account SID
- Auth token
- From number in E.164 format
- Webhook/public URL strategy for OpenClaw

Never paste Twilio credentials into chat, git, docs, memory, screenshots, or CRM notes.

## Webhook/public URL strategy

Phone providers need to reach the OpenClaw voice-call webhook.

Preferred order:

1. Stable production hostname if the customer's OpenClaw deployment already has one.
2. Tailscale Funnel when intentionally enabled and acceptable for the deployment.
3. Paid/static ngrok domain for simple pilot setups.
4. Local mock mode when testing without real calls.

Do not rely on a temporary free ngrok URL for a production Sales RoofClaw.

## Recommended rollout stages

### Stage A — Mock mode

Use mock mode first. Goal: confirm the Sales RoofClaw knows what to say and what not to say before a real phone number exists.

Expected test:

```bash
openclaw voicecall call --to "+15555550123" --message "This is a mock test. Ask the lead what roofing service they need and then stop before booking."
```

### Stage B — Twilio live test number

Use a Twilio number that is not yet advertised publicly.

Test:

- Outbound call to owner/admin
- Inbound call from owner/admin
- No-answer handling
- Voicemail behavior
- Hangup behavior
- HubSpot call note logging
- Human escalation

### Stage C — Human-reviewed live pilot

First 10 real lead calls must be reviewed by a human.

The Sales RoofClaw may:

- Greet the lead
- Identify itself as an AI assistant where required
- Confirm name, phone, address, and service need
- Ask basic qualification questions
- Offer handoff or booking only if rules are connected
- Log the call in HubSpot

The Sales RoofClaw may not:

- Quote pricing unless explicitly approved
- Promise exact appointment windows unless calendar rules are connected
- Make warranty/legal/insurance commitments
- Argue with upset customers
- Continue when transcription confidence is poor

### Stage D — Limited live mode

Only after human review succeeds:

- Business-hours calling only
- New LSA leads only
- One first-response call attempt
- Human escalation for anything unclear
- Daily review of call logs for the first week

## Minimal OpenClaw config shape

This is illustrative. Do not paste real credentials into this file.

```json
{
  "plugins": {
    "entries": {
      "voice-call": {
        "enabled": true,
        "config": {
          "provider": "twilio",
          "twilio": {
            "accountSid": "${TWILIO_ACCOUNT_SID}",
            "authToken": "${TWILIO_AUTH_TOKEN}"
          },
          "fromNumber": "${TWILIO_FROM_NUMBER}",
          "inboundPolicy": "allowlist",
          "allowFrom": ["+15555550123"],
          "outbound": {
            "defaultMode": "conversation"
          },
          "maxDurationSeconds": 600,
          "maxConcurrentCalls": 1,
          "responseSystemPrompt": "You are the phone voice of a Sales RoofClaw. Follow CALL_GUARDRAILS.md. Keep replies short, ask one question at a time, and escalate if uncertain."
        }
      }
    }
  }
}
```

## HubSpot logging requirement

Every call attempt should create a HubSpot call activity or note.

Log at minimum:

- Timestamp
- Direction: inbound/outbound
- Phone number
- Contact/deal/building association when known
- Call outcome: answered, no answer, voicemail, wrong number, do not call, escalated
- Short AI summary
- Next step

If the CRM cannot create call activities, log a note and include the limitation in `CRM_COMPATIBILITY_REPORT.md`.
