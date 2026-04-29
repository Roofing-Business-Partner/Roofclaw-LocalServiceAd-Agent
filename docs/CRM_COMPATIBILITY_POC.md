# CRM Compatibility PoC Guide

This repo is HubSpot-first.

A non-HubSpot Roofing CRM can be compatible only if the Sales RoofClaw proves it can map the HubSpot roofing standard into that CRM's available API.

Do not assume every CRM has HubSpot-equivalent objects. Many roofing CRMs are job/project-centric and do not cleanly separate person, property, opportunity, and activity.

## Required PoC questions

Before implementing this launchpad against another CRM, the Sales RoofClaw must investigate and document answers to these questions:

### Activity / engagement logging

- Can we create an engagement/activity?
- If not, can we create a note?
- Can we log a call?
- Can we log a text/message?
- Can we log an email?
- Are activities associated to contact, job/project, deal/opportunity, property/building, or only one object?
- Can activity history be read back through the API?
- Are activity endpoints available on the customer's API tier, or blocked behind partner permissions?

### Lead/customer status

- Is there a standard lead status property?
- Is there a lifecycle stage equivalent?
- What are the exact accepted status/stage strings?
- Can the agent update the status safely through the API?
- Does changing status trigger automations, notifications, or workflows?

### Opportunity/deal model

- Does the CRM create a deal/opportunity object?
- Or is the primary revenue object called job/project/lead/claim/work order?
- Can one contact have multiple opportunities?
- Can one property/building have multiple opportunities?
- Can opportunities be searched by source, status, contact, address, or external ID?

### Contact / building / deal separation

- What are the object names?
- Is there a divisible difference between contact, building/property/address, and deal/job/project?
- Can a contact own multiple buildings/properties?
- Can a building/property have multiple jobs/deals over time?
- Does the API expose property-level records, or is address embedded directly on the job/project?
- Can the agent attach files/photos to the property/building, or only to the job/project?

### Source attribution

- Can we store Google LSA lead ID/resource name?
- Can we store UTM/source/medium/campaign?
- Can we store lead channel separately from lead status?
- Can we add custom fields through the API, or must an admin configure them in the UI first?

### Scheduling / booking

- Can the CRM create calendar events/appointments?
- Can it check availability before booking?
- Can it assign a sales rep?
- Does booking notify the customer or only log an internal event?

### Writes and permissions

- Which endpoints are read-only?
- Which writes are allowed on the current API key?
- Which writes require a partner tier upgrade?
- Are rate limits documented or discovered empirically?
- Are there endpoints that return success but do not actually perform the expected write?

## Required output before non-HubSpot implementation

The Sales RoofClaw must create a local `CRM_COMPATIBILITY_REPORT.md` containing:

```markdown
# CRM Compatibility Report

CRM: <name>
Account/Tenant: <client/company>
Date:
Agent:

## Object mapping
- HubSpot Contact -> <CRM equivalent>
- HubSpot Building/Listing -> <CRM equivalent or gap>
- HubSpot Deal -> <CRM equivalent>
- HubSpot Activity/Engagement -> <CRM equivalent or gap>

## Required workflows
- Create/update person
- Create/update property/building
- Create/update opportunity
- Log inbound LSA message
- Log outbound LSA reply
- Log phone call
- Create follow-up task
- Book appointment / handoff

## Gaps
- <gap>

## Safe implementation recommendation
- Proceed / proceed with limits / do not proceed
```

If the CRM cannot separate contact, building/property, and deal/job cleanly, the Sales RoofClaw may still proceed, but it must document the compromise and avoid pretending the CRM has HubSpot's object model.

## Example: ProLine / Powrline

Our ProLine/Powrline discovery found a project-centric CRM model.

Known useful endpoints/capabilities from the existing ProLine skill:

- `find/project` — look up a project by ID, address, status, or stage.
- `edit/project` — create a new project or update an existing one. This can create project + contact together.
- `find/contact` — find a contact by ID, phone, email, or address.
- `find/event` — find events by project, assignee, date, or type.
- `events/edit` — create or reschedule appointments.
- `events/cancel` — cancel an appointment.
- `find/team_member` — look up a rep by email, phone, or name.

Important ProLine constraints from discovery:

- Lead intake uses `edit/project`, not a clean HubSpot-style contact + deal + property sequence.
- `project_status` has known values such as `Lead`, `Inspection`, `Open`, `Won`, `Complete`, `Closed`, `Lost`, and `Disqualified`.
- Activity endpoints such as `activity/create_alert`, `activity/create_call`, and `activity/create_message` were not usable at the tested standard partner tier.
- Activity history was not available in the way a HubSpot build would expect.
- `project_notes` is a single text blob; safe logging requires read-before-write and append discipline.
- No direct ProLine API send path was confirmed for customer messaging; call/text sending likely needs CallRail, phone provider, iMessage/SMS, or another channel.
- Availability checking was blocked in the tested tier, so appointment booking needs caution or human confirmation.

HubSpot-standard mapping for ProLine:

| HubSpot standard | ProLine equivalent | Confidence |
| --- | --- | --- |
| Contact | Contact fields on contact/project | Medium |
| Building/Listing | Project address / project record | Medium, but not a separate property object |
| Deal | Project | Medium |
| Activity/Engagement | Project notes or activity endpoints if enabled | Low to medium |
| Lead status | `project_status` / stage | Medium |
| Lifecycle stage | No exact standard equivalent discovered | Low |

Recommended ProLine implementation posture:

- Treat ProLine as project-centric.
- Store LSA identifiers in project notes/custom fields if available.
- Log calls/messages in project notes unless activity endpoints are enabled and verified.
- Use external channel tools for actual phone/text/email sending.
- Keep a local audit log because ProLine activity APIs may not provide HubSpot-equivalent history.

## Example: RoofLink

Our RoofLink discovery pattern is more lifecycle/job oriented.

Known working endpoints from Andrew Swan's build/discovery baseline included:

- `GET /unpaid-estimates`
- `GET /job/{id}/invoice-ledger`
- `GET /job/{id}/activity`
- `GET /events/today`
- `GET /events/next-five-days`
- `GET /light/jobs/?status=active`
- `GET /approved-jobs`
- `GET /jobs/pipeline`
- `GET /insurance-companies`
- `GET /mortgage-companies`
- `GET /customer/{id}`
- `POST /events/`
- `PUT /events/{id}`

RoofLink discovery spec also calls for testing:

- `POST /customers/`
- `GET /customers/`
- `PUT /customer/{id}`
- `GET /customer/{id}/jobs`
- `POST /jobs/`
- `GET /job/{id}`
- `PUT /job/{id}`
- `GET /job/{id}/activity`
- `GET /job/{id}/notes`
- `POST /job/{id}/notes`
- `GET /jobs/pipeline`

HubSpot-standard mapping for RoofLink:

| HubSpot standard | RoofLink equivalent | Confidence |
| --- | --- | --- |
| Contact | Customer | Medium |
| Building/Listing | Job address / customer-job relationship | Low to medium; separate property object must be proven |
| Deal | Job / pipeline item | Medium |
| Activity/Engagement | Job activity / notes | Medium if write endpoints verify |
| Lead status | Job status / pipeline status | Medium; exact strings must be discovered |
| Lifecycle stage | No exact standard equivalent proven | Low |

Recommended RoofLink implementation posture:

- Treat RoofLink as job/lifecycle-centric until proven otherwise.
- Use `customer` for person/account data.
- Use `job` for opportunity/deal workflow.
- Investigate whether address/property can be modeled independently or only as job fields.
- Use `job activity` and `job notes` for engagement logging if write endpoints work.
- Create appointments/events only after confirming event types and notification side effects.

## Example: AccuLynx

AccuLynx builds should be treated as workflow/status-centric until the account's API capabilities are verified.

Known pattern from prior RoofClaw builds:

- AccuLynx is often the operational nervous system for jobs.
- Jobs/workflows/statuses are central.
- Teams may use AccuLynx communications or at-messages for job-related prompts.
- Notes and status updates matter because owners judge the agent by whether AccuLynx remains accurate.

Before adapting this Sales Rep launchpad to AccuLynx, discover:

- How to create/read/update contacts.
- How to create/read/update jobs or opportunities.
- Whether leads exist separately from jobs.
- Whether property/address exists as a separate object or only on the job.
- How to log notes, calls, texts, or communications.
- Whether workflow statuses and task lists are readable/writable.
- Whether communications trigger real notifications or only create internal history.

HubSpot-standard mapping for AccuLynx must not be assumed. Build the mapping from live endpoint discovery.
