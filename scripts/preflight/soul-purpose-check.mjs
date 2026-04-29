#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const file = process.argv[2];

if (!file) {
  console.error('Usage: node scripts/preflight/soul-purpose-check.mjs /path/to/SOUL.md');
  process.exit(2);
}

const soulPath = path.resolve(file);
if (!fs.existsSync(soulPath)) {
  console.error(`SOUL.md not found: ${soulPath}`);
  process.exit(2);
}

const text = fs.readFileSync(soulPath, 'utf8');
const normalized = text.toLowerCase();

const salesSignals = [
  'sales rep', 'sales representative', 'sdr', 'bdr', 'inbound sales',
  'outbound sales', 'lead qualification', 'qualify leads', 'appointment setter',
  'speed-to-lead', 'closer', 'closing deals', 'revenue desk', 'sales follow-up',
  'local services ads', 'lsa leads', 'respond to leads'
];

const conflictSignals = [
  'chief of staff', 'executive assistant', 'production coordinator',
  'operations coordinator', 'dispatcher', 'project manager', 'recruiting',
  'recruiter', 'bookkeeping', 'bookkeeper', 'invoicing', 'collections',
  'support agent', 'customer support', 'estimator', 'supplement', 'content agent'
];

function countSignals(signals) {
  return signals.filter(signal => normalized.includes(signal)).length;
}

const salesCount = countSignals(salesSignals);
const conflictHits = conflictSignals.filter(signal => normalized.includes(signal));

const explicitPrimarySales = /primary (mission|role|purpose).*sales|sales.*primary (mission|role|purpose)|i am (a |the )?(sales rep|sdr|closer|appointment setter|revenue desk)/i.test(text);

let classification = 'BORDERLINE';
let reason = '';

if ((explicitPrimarySales || salesCount >= 2) && conflictHits.length === 0) {
  classification = 'SALES_REP';
  reason = 'SOUL.md has clear sales identity signals and no strong conflicting primary-role signals.';
} else if (salesCount === 0 && conflictHits.length > 0) {
  classification = 'NON_SALES';
  reason = `SOUL.md contains non-sales role signals: ${conflictHits.join(', ')}.`;
} else if (salesCount > 0 && conflictHits.length > 0) {
  classification = 'BORDERLINE';
  reason = `SOUL.md mixes sales signals with conflicting role signals: ${conflictHits.join(', ')}.`;
} else {
  classification = 'BORDERLINE';
  reason = 'SOUL.md does not clearly identify the agent as a primary Sales Rep.';
}

const result = {
  classification,
  salesSignalCount: salesCount,
  conflictSignals: conflictHits,
  reason,
  action: classification === 'SALES_REP'
    ? 'Proceed to P0 pre-setup.'
    : 'STOP. Reject implementation and recommend a dedicated Sales RoofClaw V2.0.'
};

console.log(JSON.stringify(result, null, 2));
process.exit(classification === 'SALES_REP' ? 0 : 1);
