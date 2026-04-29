# Source References

Primary API references used for this launchpad:

## Google Ads / Local Services Ads

- OAuth scopes list — Google Ads API uses `https://www.googleapis.com/auth/adwords`:
  - https://developers.google.com/identity/protocols/oauth2/scopes
- `LocalServicesLead` resource:
  - https://developers.google.com/google-ads/api/reference/rpc/latest/LocalServicesLead
- `LocalServicesLeadConversation` resource:
  - https://developers.google.com/google-ads/api/reference/rpc/latest/LocalServicesLeadConversation
- `LocalServicesLeadService.AppendLeadConversation` REST method:
  - https://developers.google.com/google-ads/api/reference/rpc/latest/LocalServicesLeadService#appendleadconversation

## HubSpot CRM

- Private app scope requirements:
  - https://developers.hubspot.com/docs/apps/legacy-apps/private-apps/overview
- CRM objects API guide:
  - https://developers.hubspot.com/docs/guides/api/crm/objects/overview
- Contacts API guide:
  - https://developers.hubspot.com/docs/guides/api/crm/objects/contacts
- Deals API guide:
  - https://developers.hubspot.com/docs/guides/api/crm/objects/deals
- Notes API guide:
  - https://developers.hubspot.com/docs/guides/api/crm/engagements/notes
- Associations API guide:
  - https://developers.hubspot.com/docs/guides/api/crm/associations/associations-v4

## Note

APIs change. A Sales RoofClaw implementing this repo should verify field names and version-specific behavior against the live docs before enabling production writes.

## xAI / Grok voice

- Grok STT/TTS API announcement:
  - https://x.ai/news/grok-stt-and-tts-apis
- xAI Voice Agent API / Grok Voice Think Fast docs:
  - https://docs.x.ai/developers/model-capabilities/audio/voice-agent
- xAI text-to-speech docs:
  - https://docs.x.ai/docs/guides/text-to-speech
- xAI speech-to-text docs:
  - https://docs.x.ai/docs/guides/speech-to-text

## OpenClaw Voice Call

- OpenClaw Voice Call plugin docs:
  - https://docs.openclaw.ai/plugins/voice-call
