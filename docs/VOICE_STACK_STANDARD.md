# Voice Stack Standard

This repo makes the voice decision for the customer.

## Default stack

- **Telephony:** Twilio
- **Routing / attribution when needed:** CallRail
- **Default voice AI path:** xAI/Grok cascaded voice stack
- **Direct realtime voice agent:** Grok Voice Think Fast 1.0 is upcoming/advanced, not the normal customer self-setup path yet
- **ElevenLabs:** optional only for custom branded voice polish

## What "all-xAI" means

The default Sales RoofClaw voice stack should use xAI for the AI voice pipeline:

1. **Grok STT** — caller speech to text
2. **Grok LLM** — reasoning and tool calling
3. **Grok TTS** — agent text to speech

This replaces the old Vapi/n8n/Pinecone-style stack for the normal RoofClaw use case.

Twilio still carries the phone call. OpenClaw runs the agent. HubSpot is the CRM context. xAI handles the voice AI layer.

## Recommended xAI defaults

Use these defaults unless the customer has a clear reason to change them:

- STT provider: `xai`
- STT mode: realtime/streaming for active calls; batch only for post-call transcription or voicemail/media review
- STT formatting: enabled where supported, especially for phone numbers, dates, money, and addresses
- LLM provider: `xai`
- LLM model: use the customer's configured current Grok reasoning/tool model, with a fast model for call turns when available
- TTS provider: `xai`
- TTS voice: `ara` for warm customer-service tone, or `rex` for clear professional/business tone
- TTS language: `en` unless the business explicitly serves another language

Do not default to ElevenLabs. xAI has its own TTS voices, including `ara`, `eve`, `rex`, `sal`, and `leo`.

## Grok Voice Think Fast 1.0

`grok-voice-think-fast-1.0` is promising and likely the future preferred path for direct speech-to-speech phone agents.

Do **not** make it the normal customer setup path yet unless OpenClaw has first-class registered support on that machine or RBP has tested a safe adapter.

Reason:

- xAI documents the Voice Agent API and `grok-voice-think-fast-1.0` over WebSocket.
- OpenClaw Voice Call supports realtime voice/transcription providers, but an unregistered provider is not magically active just because a model string exists.
- If OpenClaw does not show Grok Voice Think Fast as a registered realtime voice provider, treat it as advanced/experimental.

Recommended wording for customers:

> Today we use the all-xAI cascaded stack: Grok STT, Grok LLM, and Grok TTS. Grok Voice Think Fast is on the roadmap as a direct realtime voice-agent upgrade once OpenClaw support is verified.

## When to use ElevenLabs

ElevenLabs is optional.

Use it only when:

- The client wants a custom cloned/branded voice.
- The client strongly prefers a specific ElevenLabs voice.
- xAI TTS fails the client's voice-quality test.

Do not add ElevenLabs just because the agent needs a voice. xAI TTS covers the default requirement.

## Phone-call context boundaries

Phone calls must not expose the whole agent memory to customers.

The phone prompt should narrow the agent to Customer Phone Mode and allow only:

- Approved sales script
- Call guardrails
- Company-safe FAQ
- Current LSA lead/contact/deal/building context
- HubSpot lookup/write actions needed for the call
- Calendar/booking rules if explicitly connected
- Human escalation

The phone prompt should not allow free access to:

- Owner/private conversations
- Internal strategy notes
- Other customers or jobs
- Credentials/API keys
- Broad long-term memory
- Non-sales tools unrelated to the call

## Required benchmark before replacing defaults

Do not replace the default xAI cascaded stack with another provider unless the new provider clearly wins on real roofing calls.

Use at least 10 short samples:

- Clear homeowner voice
- Noisy jobsite background
- Southern accent
- Fast speaker
- Elderly caller
- Bad cell connection
- Address with street number and ZIP/postal code
- Roofing terms: shingles, TPO, fascia, soffit, leak, inspection, insurance claim
- Interruptions / overlapping speech
- Voicemail

Score each provider:

| Category | Weight |
| --- | --- |
| Name/phone/address accuracy | 30% |
| Roofing term accuracy | 20% |
| Latency | 20% |
| Stability / no dropped stream | 15% |
| Cost | 10% |
| Voice naturalness | 5% |

## Minimum voice behavior requirements

The Sales RoofClaw's phone voice must:

- Speak in short turns.
- Ask one question at a time.
- Confirm key facts back to the lead.
- Never pretend to be human.
- Disclose AI assistant status when required by law or company policy.
- Stop and escalate if the lead is angry, confused, legal/insurance-heavy, or asking for pricing beyond approved rules.
- Log every call.

## Prompt separation

Do not rely only on the main `SOUL.md` for phone behavior.

Use a phone-specific response system prompt in OpenClaw Voice Call config. It should reference:

- `SOUL.md` for identity
- `CALL_GUARDRAILS.md` for phone behavior
- Approved scripts
- Escalation rules
- HubSpot logging requirements

Phone calls are high-risk because the agent is speaking in real time. Keep the phone prompt narrower than the general agent mission.
