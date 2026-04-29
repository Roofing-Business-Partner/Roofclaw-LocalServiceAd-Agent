# Voice Stack Standard

This repo makes a conservative production recommendation.

## Default stack

- **Telephony:** Twilio
- **Routing / attribution when needed:** CallRail
- **Default voice AI path:** OpenClaw Voice Call with a stable, already-supported STT/TTS or realtime provider
- **Grok/xAI:** benchmark candidate, not default production standard yet

## Why not default to Grok/xAI yet?

xAI/Grok voice may become the best option. It may already be excellent. But this launchpad should not base customer setup on YouTube claims or hype.

Use Grok/xAI only after the Sales RoofClaw runs a side-by-side benchmark on the customer's actual call conditions.

## Default recommendation today

For customer-facing setup guidance, recommend:

1. Start with the OpenClaw-supported default/stable provider already configured on the RoofClaw.
2. If the customer already has an OpenAI key and no other voice provider chosen, use OpenAI-backed realtime/STT/TTS for the first pilot.
3. If the customer cares heavily about branded voice quality after the workflow is proven, evaluate ElevenLabs or xAI/Grok TTS.
4. If low-latency call transcription is the bottleneck, benchmark xAI/Grok, Deepgram, OpenAI, and any available Google/Gemini option against the same call samples.

The launchpad should optimize for reliability, safe behavior, and simple setup before optimizing for the most impressive voice demo.

## Required benchmark before changing providers

Before making Grok/xAI or any other provider the live default, run the benchmark below.

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

Do not switch production providers unless the new provider clearly wins on the customer's actual use case.

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
