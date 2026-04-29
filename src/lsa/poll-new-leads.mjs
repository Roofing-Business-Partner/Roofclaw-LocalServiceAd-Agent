#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { googleAdsSearchStream } from './google-ads-rest.mjs';

const statePath = process.env.LSA_SEEN_STATE_PATH || '.state/lsa-seen.json';
const limit = Number(process.env.LSA_POLL_LIMIT || 50);

function ensureDir(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}

function loadState() {
  if (!fs.existsSync(statePath)) return { seenLeads: {}, seenConversations: {}, updatedAt: null };
  return JSON.parse(fs.readFileSync(statePath, 'utf8'));
}

function saveState(state) {
  ensureDir(statePath);
  const maxEntries = Number(process.env.LSA_SEEN_MAX_ENTRIES || 5000);
  for (const key of ['seenLeads', 'seenConversations']) {
    const entries = Object.entries(state[key] || {}).sort((a, b) => String(b[1]).localeCompare(String(a[1])));
    state[key] = Object.fromEntries(entries.slice(0, maxEntries));
  }
  state.updatedAt = new Date().toISOString();
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}

function flattenSearchStream(streamResponse) {
  if (!Array.isArray(streamResponse)) return [];
  return streamResponse.flatMap(chunk => chunk.results || []);
}

async function pollLeads() {
  const query = `
SELECT
  local_services_lead.resource_name,
  local_services_lead.id,
  local_services_lead.creation_date_time,
  local_services_lead.lead_type,
  local_services_lead.lead_status,
  local_services_lead.category_id,
  local_services_lead.service_id,
  local_services_lead.contact_details
FROM local_services_lead
WHERE local_services_lead.creation_date_time DURING LAST_1_DAYS
ORDER BY local_services_lead.creation_date_time DESC
LIMIT ${limit}`;

  const rows = flattenSearchStream(await googleAdsSearchStream({ query }));
  return rows.map(row => row.localServicesLead).filter(Boolean);
}

async function main() {
  const state = loadState();
  state.seenLeads ||= {};
  state.seenConversations ||= {};

  const leads = await pollLeads();
  const newLeads = [];

  for (const lead of leads) {
    const id = lead.resourceName || lead.resource_name || String(lead.id || '');
    if (!id) continue;
    if (state.seenLeads[id]) continue;
    state.seenLeads[id] = lead.creationDateTime || lead.creation_date_time || new Date().toISOString();
    newLeads.push(lead);
  }

  saveState(state);

  console.log(JSON.stringify({
    checkedAt: new Date().toISOString(),
    statePath,
    totalFetched: leads.length,
    newLeadCount: newLeads.length,
    newLeads
  }, null, 2));
}

main().catch(error => {
  console.error(JSON.stringify({ error: error.message, stack: error.stack }, null, 2));
  process.exit(1);
});
