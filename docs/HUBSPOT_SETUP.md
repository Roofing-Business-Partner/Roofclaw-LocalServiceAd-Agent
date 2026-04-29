# HubSpot Setup

## Recommended objects

Use standard HubSpot objects first:

- Contact — homeowner/property manager/business contact
- Company — optional, mostly for commercial leads
- Deal — sales opportunity
- Notes/Calls/Tasks — interaction logging and next steps

## Recommended contact properties

Use existing properties where possible:

- `firstname`
- `lastname`
- `email`
- `phone`
- `lifecyclestage`
- `hs_lead_status`

Optional custom properties:

- `roofclaw_lsa_lead_id`
- `roofclaw_lsa_resource_name`
- `roofclaw_last_touch_channel`
- `roofclaw_ai_handled`
- `roofclaw_sales_urgency`
- `roofclaw_requested_service`

## Recommended deal properties

Use existing properties where possible:

- `dealname`
- `pipeline`
- `dealstage`
- `hubspot_owner_id`
- `amount` only if approved

Optional custom properties:

- `roofclaw_source_detail`
- `roofclaw_lsa_lead_id`
- `roofclaw_lsa_resource_name`
- `roofclaw_next_step`
- `roofclaw_ai_summary`

## Pipeline rule

Do not guess pipeline IDs or stage IDs.

Read available pipelines first, then ask the owner which one should receive LSA sales opportunities.


## Association endpoint note

HubSpot's current association guide documents date-versioned association endpoints such as `/crm/objects/2026-03/{fromObjectType}/{fromObjectId}/associations/default/{toObjectType}/{toObjectId}`. Some older examples and integrations use `/crm/v4/objects/...`. The starter code tries the current date-versioned path first and falls back to the older v4 path on 404.
