# HubSpot Roofing Standard

This launchpad is built around the **Roofing Business Partner HubSpot standard**.

The default implementation target is HubSpot because RBP customers already use HubSpot as the cleanest, most flexible CRM foundation for a Sales RoofClaw.

Other roofing CRMs can support similar outcomes, but the Sales RoofClaw must first prove that the CRM exposes equivalent objects, associations, status fields, and activity logging endpoints.

## Why HubSpot is the standard path

HubSpot gives the Sales RoofClaw a clear, composable CRM model:

- **Contact** — the person: homeowner, property manager, buyer, decision maker, tenant, adjuster contact, etc.
- **Company** — optional business/commercial account, property management company, GC, or commercial customer.
- **Building / Listing custom object** — the physical property. This is separate from both the person and the sales opportunity.
- **Deal** — the revenue opportunity at a specific building.
- **Activities / engagements** — notes, calls, emails, communications, meetings, and tasks that document what happened and what happens next.

This matters because roofing businesses often have relationships that do not fit a simple "one contact = one job" model.

A contact can own multiple properties. A building can have multiple deals over time. A deal can involve multiple contacts. A photo file, inspection record, roof report, or future service opportunity should usually be tied to the physical building, not blindly attached to the latest deal or the first contact found.

## The building / listing object

RBP HubSpot builds include a custom object commonly called:

- `Building`
- `Listing`
- or a tenant-specific equivalent name

The exact internal object type can differ by HubSpot portal. Do not guess it.

The Sales RoofClaw must discover it through HubSpot schemas before writing:

```text
GET /crm/v3/schemas
```

Look for the custom object that represents the physical property/location.

### Building object purpose

Use the building/listing object for:

- Physical property address
- Property owner/contact association
- Inspection or service history tied to the location
- Photos or file references tied to the location
- Multiple deals over time at the same location
- LSA lead address normalization and duplicate detection

### Why not just associate files to the deal?

Because one building can have many deals:

- inspection deal
- repair deal
- replacement deal
- warranty/service deal
- future storm/restoration opportunity

A photo folder or property file should survive beyond one deal.

### Why not just associate files to the contact?

Because one contact can own or manage many buildings.

A property manager, investor, landlord, or repeat customer may have multiple addresses. If the Sales RoofClaw attaches property-specific context only to the contact, future follow-up becomes muddy.

## Default HubSpot object model

### Contact

Create or update a contact from the LSA lead's person-level data:

- Name
- Phone
- Email
- Preferred contact method when known
- Lead source details

Use standard properties where possible:

- `firstname`
- `lastname`
- `email`
- `phone`
- `lifecyclestage`
- `hs_lead_status`

Recommended defaults for new Google LSA leads:

```text
lifecyclestage = lead
hs_lead_status = NEW
```

If a portal uses a custom property that sounds like "lease status," do not confuse it with HubSpot's standard lead status. For sales lead handling, the standard property is `hs_lead_status` unless the owner confirms otherwise.

### Building / Listing

Create or update the building/listing object from property-level data:

- Street address
- City
- State/province
- Postal code
- Country
- Property type if known
- Source lead ID / source channel
- Normalized address key if the portal uses one

When the LSA lead has no usable address, do not invent one. Create the contact/deal and mark the building association as pending.

### Deal

Create or update a deal for the specific opportunity:

- Deal name
- Pipeline
- Deal stage
- Owner
- Lead source = Google Local Services Ads
- Requested service
- Urgency
- AI summary
- Next step
- LSA lead resource name / lead ID

The deal should normally associate to:

- Primary contact
- Building/listing
- Company if commercial/account-based

### Activities / engagements

HubSpot's modern CRM APIs model activities as CRM objects such as:

- Notes
- Calls
- Emails
- Communications
- Meetings
- Tasks

Older docs and teams may still call these "engagements." In this repo, "activity/engagement" means any CRM activity object that records a sales touch.

The Sales RoofClaw should log:

- LSA message received
- LSA reply sent
- Phone call attempted/completed
- iMessage/SMS sent when approved
- Email sent when approved
- Qualification summary
- Appointment handoff
- Human escalation
- Next task

Associate activities to the most specific useful records:

1. Contact
2. Deal
3. Building/listing, when supported by the portal's object associations

## Association rules

Before writing associations, discover available labels/types:

```text
GET /crm/v4/associations/{fromObjectType}/{toObjectType}/labels
```

Recommended conceptual associations:

- Contact ↔ Building/Listings: owns, manages, lives at, decision maker, tenant, property manager
- Building/Listing ↔ Deal: opportunity at property
- Contact ↔ Deal: primary buyer / decision maker
- Activity ↔ Contact: person touched
- Activity ↔ Deal: opportunity touched
- Activity ↔ Building/Listing: property touched, if supported

Do not create duplicate custom association labels unless the owner approves the HubSpot schema change.

## Google LSA → HubSpot write sequence

For a new LSA lead:

1. Normalize person data.
2. Search contact by phone/email.
3. Create/update contact.
4. Normalize property data if available.
5. Search building/listing by normalized address or portal-specific property key.
6. Create/update building/listing if address is reliable.
7. Search for an existing open deal for this contact + building + source.
8. Create/update deal.
9. Associate contact ↔ building/listing ↔ deal.
10. Log the LSA inbound message as an activity.
11. Append approved LSA reply if safe.
12. Log outbound reply as an activity.
13. Create a follow-up task or escalate to a human.

## Data quality rules

- Do not create a building/listing from vague location text.
- Do not overwrite a known property owner with an unverified lead contact.
- Do not merge contacts automatically unless duplicate rules are explicit.
- Preserve raw source IDs: LSA lead ID and resource name.
- Mark uncertain mappings as pending review.
- If a HubSpot write would create a duplicate, stop and ask or route to human review.
