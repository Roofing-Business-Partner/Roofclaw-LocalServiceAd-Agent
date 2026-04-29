#!/usr/bin/env node
import fs from 'node:fs';
import { liveMode, hubspotConfig } from '../config.mjs';
import { upsertContact, createDeal, associateDefault } from '../hubspot/client.mjs';

const file = process.argv[2];
const execute = process.argv.includes('--execute');

if (!file) {
  console.error('Usage: node src/examples/dry-run-lead-to-hubspot.mjs fixtures/sample-lsa-lead.json [--execute]');
  process.exit(2);
}

const lead = JSON.parse(fs.readFileSync(file, 'utf8'));

function splitName(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstname: parts[0] || '',
    lastname: parts.slice(1).join(' ') || ''
  };
}

function normalizedAddressKey(property = {}) {
  const parts = [
    property.address1 || property.street || property.streetAddress,
    property.city,
    property.state || property.region,
    property.postal_code || property.postalCode || property.zip,
    property.country
  ];
  return parts.filter(Boolean).join('|').toLowerCase().replace(/\s+/g, ' ').trim();
}

function mapLeadToHubSpot(lead) {
  const contact = lead.contact || lead.contact_details || {};
  const property = lead.property || lead.address || lead.service_address || {};
  const name = splitName(contact.name || contact.fullName || 'LSA Lead');
  const service = lead.service_id || lead.service || 'roofing request';
  const lsaId = String(lead.id || '').trim();

  const contactProperties = {
    firstname: name.firstname,
    lastname: name.lastname,
    email: contact.email || undefined,
    phone: contact.phone || contact.phoneNumber || undefined,
    lifecyclestage: 'lead',
    hs_lead_status: 'NEW'
  };

  Object.keys(contactProperties).forEach(key => contactProperties[key] === undefined && delete contactProperties[key]);

  const buildingProperties = {
    // These are conceptual property names. Map them to the portal's Building/Listing schema before live writes.
    address: property.address1 || property.street || property.streetAddress || undefined,
    city: property.city || undefined,
    state: property.state || property.region || undefined,
    zip: property.postal_code || property.postalCode || property.zip || undefined,
    country: property.country || undefined,
    roofclaw_normalized_address_key: normalizedAddressKey(property) || undefined,
    roofclaw_lsa_lead_id: lsaId || undefined
  };

  Object.keys(buildingProperties).forEach(key => buildingProperties[key] === undefined && delete buildingProperties[key]);

  const dealProperties = {
    dealname: `LSA - ${contact.name || contact.phone || contact.email || 'New Lead'} - ${service}`,
    pipeline: process.env.HUBSPOT_DEAL_PIPELINE_ID || undefined,
    dealstage: process.env.HUBSPOT_NEW_LEAD_DEAL_STAGE_ID || undefined,
    hubspot_owner_id: process.env.HUBSPOT_OWNER_ID || undefined
  };

  Object.keys(dealProperties).forEach(key => dealProperties[key] === undefined && delete dealProperties[key]);

  const context = {
    source: 'Google Local Services Ads',
    lsaLeadId: lsaId,
    lsaResourceName: lead.resource_name || lead.resourceName,
    leadType: lead.lead_type || lead.leadType,
    leadStatus: lead.lead_status || lead.leadStatus,
    createdAt: lead.creation_date_time || lead.creationDateTime,
    category: lead.category_id || lead.categoryId,
    service
  };

  return {
    contactProperties,
    buildingProperties,
    dealProperties,
    context,
    buildingWriteNote: 'Map buildingProperties to the tenant-specific Building/Listing object schema before live writes.'
  };
}

const payload = mapLeadToHubSpot(lead);

console.log(JSON.stringify({ mode: execute ? 'execute-requested' : 'dry-run', payload }, null, 2));

if (!execute) process.exit(0);
if (!liveMode()) {
  throw new Error('Refusing to write because ROOFCLAW_SALES_LIVE_MODE is not true.');
}

const config = hubspotConfig();
const contact = await upsertContact({ token: config.token, properties: payload.contactProperties });
const deal = await createDeal({ token: config.token, properties: payload.dealProperties });
await associateDefault({ token: config.token, fromType: 'deal', fromId: deal.id, toType: 'contact', toId: contact.id });

console.log(JSON.stringify({
  contactId: contact.id,
  dealId: deal.id,
  buildingWriteSkipped: 'Starter execute path does not write Building/Listing objects until portal schema mapping is implemented.'
}, null, 2));
