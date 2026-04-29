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
