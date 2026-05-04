# Phone Setup Standard

This repo makes the phone decision for the customer.

Default recommendation:

1. **Twilio** for the Sales RoofClaw's direct phone number and OpenClaw Voice Call integration.
2. **CallRail** when the customer needs routed numbers, marketing attribution, call tracking, LSA/office-number complexity, or custom forwarding logic.
3. **xAI/Grok cascaded voice stack** for STT → LLM → TTS.
4. **Mock mode first**, then one live test number, then first 10 real calls under human review.

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
- xAI/Grok STT, LLM, and TTS configuration
- A phone-specific response system prompt

## Required xAI items

The customer or builder needs:

- xAI API key stored securely in OpenClaw configuration or environment
- Grok STT available for call transcription
- Grok LLM available for reasoning/tool calls
- Grok TTS available for spoken output
- A chosen xAI voice, defaulting to `ara` or `rex`

Do not expose the xAI API key in chat, docs, git, screenshots, CRM notes, or memory.

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

## Twilio fast-path onboarding

A roofer should not need to click through the Twilio Console just to paste a webhook URL.

This repo includes a Twilio onboarding preflight inspired by Nicolò Tognoni's open-source Patter SDK, which showed a clean pattern for binding a carrier number to an agent webhook. We are not replacing OpenClaw Voice Call with Patter. We are borrowing the useful setup affordance: validate the phone inputs, confirm the number belongs to the Twilio account, generate the OpenClaw config shape, and optionally set Twilio's `VoiceUrl` through the Twilio API.

Credit / inspiration:

```text
https://github.com/PatterAI/Patter
```

### Dry-run preflight

Set environment variables first. Do not paste real secrets into docs, git, chat, screenshots, CRM notes, or memory.

```bash
export TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
export TWILIO_AUTH_TOKEN=***
export TWILIO_FROM_NUMBER=+15555550123
export VOICE_CALL_PUBLIC_URL=https://voice.example.com/voice/webhook

npm run phone:twilio:check
```

The preflight:

- validates required environment variables;
- rejects loopback/private webhook hosts that Twilio cannot reach;
- checks that `TWILIO_FROM_NUMBER` belongs to the Twilio account;
- prints a redacted summary;
- prints an OpenClaw `plugins.entries.voice-call` config snippet using Twilio + xAI streaming/TTS defaults.

For docs-only or CI validation without calling Twilio:

```bash
npm run phone:twilio:offline
```

### Apply Twilio webhook

Only after the owner approves the live test number and public URL:

```bash
VOICE_CALL_LIVE_MODE=true npm run phone:twilio:apply
```

`phone:twilio:apply` requires both `VOICE_CALL_LIVE_MODE=true` and the script's internal `--yes` flag. It updates only the Twilio incoming number's `VoiceUrl` to the configured OpenClaw webhook. It does not buy numbers, enable live calling by itself, or relax OpenClaw call guardrails.

### What this removes from setup

Without the fast path, the builder has to:

1. find the Twilio number in Console;
2. discover the right webhook path;
3. paste the public URL manually;
4. remember POST method;
5. then separately build OpenClaw config.

With the fast path, the normal roofer setup becomes:

1. collect Twilio SID/token/owned number securely;
2. choose a stable public webhook URL;
3. run the preflight;
4. review generated config;
5. run one gated apply;
6. run `openclaw voicecall setup` and smoke tests.

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

This is illustrative. Do not paste real credentials into this file. Confirm exact OpenClaw config shape against the installed OpenClaw version before applying.

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
          "streaming": {
            "enabled": true,
            "provider": "xai"
          },
          "tts": {
            "enabled": true,
            "provider": "xai",
            "providers": {
              "xai": {
                "apiKey": "${XAI_API_KEY}",
                "voice": "ara"
              }
            }
          },
          "responseSystemPrompt": "You are the phone voice of a Sales RoofClaw in Customer Phone Mode. Follow CALL_GUARDRAILS.md. Keep replies short, ask one question at a time, never expose internal memory, and escalate if uncertain."
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
