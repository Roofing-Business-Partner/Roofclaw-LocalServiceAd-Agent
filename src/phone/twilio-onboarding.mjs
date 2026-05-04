#!/usr/bin/env node
const TWILIO_API_BASE = 'https://api.twilio.com/2010-04-01';
const DEFAULT_WEBHOOK_PATH = '/voice/webhook';
const DEFAULT_SERVE_PORT = 3334;

function usage() {
  return `Usage:
  node src/phone/twilio-onboarding.mjs [--offline] [--json]
  node src/phone/twilio-onboarding.mjs --apply --yes [--json]

Environment:
  TWILIO_ACCOUNT_SID       Required. Twilio Account SID, starts with AC.
  TWILIO_AUTH_TOKEN        Required. Twilio Auth Token. Never commit it.
  TWILIO_FROM_NUMBER       Required. Owned Twilio number in E.164 format.
  VOICE_CALL_PUBLIC_URL    Required. Public HTTPS webhook URL or host/base URL.

Optional:
  VOICE_CALL_WEBHOOK_PATH  Defaults to ${DEFAULT_WEBHOOK_PATH} when VOICE_CALL_PUBLIC_URL is a base URL.
  VOICE_CALL_SERVE_PORT    Defaults to ${DEFAULT_SERVE_PORT} in generated OpenClaw snippet.
  TWILIO_STATUS_CALLBACK_URL Optional status callback URL.
  VOICE_CALL_LIVE_MODE=true Required for --apply.

Default mode validates and previews. --apply updates the Twilio number VoiceUrl only when --yes and VOICE_CALL_LIVE_MODE=true are both set.`;
}

function parseArgs(argv) {
  const args = new Set(argv);
  return {
    apply: args.has('--apply'),
    yes: args.has('--yes'),
    json: args.has('--json'),
    offline: args.has('--offline')
  };
}

function envValue(name) {
  const value = process.env[name];
  return typeof value === 'string' ? value.trim() : '';
}

function isLiveMode() {
  return envValue('VOICE_CALL_LIVE_MODE').toLowerCase() === 'true';
}

function isE164(number) {
  return /^\+[1-9]\d{7,14}$/.test(number);
}

function isPrivateHostname(hostname) {
  const host = hostname.toLowerCase();
  if (['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(host)) return true;
  if (host.endsWith('.local') || host.endsWith('.internal') || host.endsWith('.test')) return true;

  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!ipv4) return false;
  const [a, b] = ipv4.slice(1).map(Number);
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT/Tailscale without Funnel is not public.
  return false;
}

function normalizePublicWebhookUrl(rawUrl, webhookPath = DEFAULT_WEBHOOK_PATH) {
  if (!rawUrl) return '';
  const withScheme = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
  const url = new URL(withScheme);

  if (url.protocol !== 'https:') {
    throw new Error('VOICE_CALL_PUBLIC_URL must use https for Twilio webhooks.');
  }
  if (isPrivateHostname(url.hostname)) {
    throw new Error(`VOICE_CALL_PUBLIC_URL host ${url.hostname} is not publicly reachable. Use a stable public hostname, Tailscale Funnel URL, or a production tunnel.`);
  }

  if (!url.pathname || url.pathname === '/') {
    url.pathname = webhookPath.startsWith('/') ? webhookPath : `/${webhookPath}`;
  }
  url.hash = '';
  return url.toString();
}

function twilioAuthHeader(accountSid, authToken) {
  return `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`;
}

async function twilioRequest(path, { method = 'GET', accountSid, authToken, body } = {}) {
  const response = await fetch(`${TWILIO_API_BASE}${path}`, {
    method,
    headers: {
      Authorization: twilioAuthHeader(accountSid, authToken),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  });
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!response.ok) {
    const message = data?.message || response.statusText;
    throw new Error(`Twilio ${method} ${path} failed: ${response.status} ${message}`);
  }
  return data;
}

async function findIncomingNumber({ accountSid, authToken, phoneNumber }) {
  const params = new URLSearchParams({ PhoneNumber: phoneNumber });
  const data = await twilioRequest(`/Accounts/${encodeURIComponent(accountSid)}/IncomingPhoneNumbers.json?${params}`, {
    accountSid,
    authToken
  });
  const numbers = data?.incoming_phone_numbers || [];
  return numbers[0] || null;
}

async function updateIncomingNumberWebhook({ accountSid, authToken, numberSid, webhookUrl, statusCallbackUrl }) {
  const body = new URLSearchParams({ VoiceUrl: webhookUrl, VoiceMethod: 'POST' });
  if (statusCallbackUrl) {
    body.set('StatusCallback', statusCallbackUrl);
    body.set('StatusCallbackMethod', 'POST');
  }
  return twilioRequest(`/Accounts/${encodeURIComponent(accountSid)}/IncomingPhoneNumbers/${encodeURIComponent(numberSid)}.json`, {
    method: 'POST',
    accountSid,
    authToken,
    body
  });
}

function buildConfigSnippet({ accountSid, fromNumber, webhookUrl, servePort }) {
  return {
    plugins: {
      entries: {
        'voice-call': {
          enabled: true,
          config: {
            provider: 'twilio',
            fromNumber,
            twilio: {
              accountSid,
              authToken: '${TWILIO_AUTH_TOKEN}'
            },
            serve: {
              port: servePort,
              path: new URL(webhookUrl).pathname
            },
            publicUrl: webhookUrl,
            inboundPolicy: 'allowlist',
            allowFrom: ['+15555550123'],
            outbound: {
              defaultMode: 'conversation'
            },
            streaming: {
              enabled: true,
              provider: 'xai',
              providers: {
                xai: {
                  apiKey: '${XAI_API_KEY}',
                  endpointingMs: 800,
                  language: 'en'
                }
              }
            },
            tts: {
              provider: 'xai',
              providers: {
                xai: {
                  apiKey: '${XAI_API_KEY}',
                  voice: envValue('VOICE_TTS_VOICE') || 'ara'
                }
              }
            },
            responseSystemPrompt: 'You are the phone voice of a Sales RoofClaw in Customer Phone Mode. Follow CALL_GUARDRAILS.md. Keep replies short, ask one question at a time, never expose internal memory, and escalate if uncertain.'
          }
        }
      }
    }
  };
}

function validateInputs() {
  const accountSid = envValue('TWILIO_ACCOUNT_SID');
  const authToken = envValue('TWILIO_AUTH_TOKEN');
  const fromNumber = envValue('TWILIO_FROM_NUMBER');
  const rawPublicUrl = envValue('VOICE_CALL_PUBLIC_URL');
  const webhookPath = envValue('VOICE_CALL_WEBHOOK_PATH') || DEFAULT_WEBHOOK_PATH;
  const servePort = Number(envValue('VOICE_CALL_SERVE_PORT') || DEFAULT_SERVE_PORT);
  const statusCallbackUrl = envValue('TWILIO_STATUS_CALLBACK_URL');
  const errors = [];

  if (!accountSid) errors.push('TWILIO_ACCOUNT_SID is required.');
  if (accountSid && !/^AC[a-zA-Z0-9]{32}$/.test(accountSid)) errors.push('TWILIO_ACCOUNT_SID should look like AC followed by 32 characters.');
  if (!authToken) errors.push('TWILIO_AUTH_TOKEN is required.');
  if (!fromNumber) errors.push('TWILIO_FROM_NUMBER is required.');
  if (fromNumber && !isE164(fromNumber)) errors.push('TWILIO_FROM_NUMBER must be E.164, e.g. +15555550123.');
  if (!rawPublicUrl) errors.push('VOICE_CALL_PUBLIC_URL is required.');
  if (!Number.isInteger(servePort) || servePort <= 0 || servePort > 65535) errors.push('VOICE_CALL_SERVE_PORT must be a valid TCP port.');

  let webhookUrl = '';
  try {
    if (rawPublicUrl) webhookUrl = normalizePublicWebhookUrl(rawPublicUrl, webhookPath);
    if (statusCallbackUrl) normalizePublicWebhookUrl(statusCallbackUrl, '');
  } catch (error) {
    errors.push(error.message);
  }

  return {
    accountSid,
    authToken,
    fromNumber,
    webhookUrl,
    statusCallbackUrl,
    servePort,
    errors
  };
}

function redactSid(sid) {
  return sid ? `${sid.slice(0, 6)}…${sid.slice(-4)}` : '';
}

function printHuman(result) {
  console.log('Twilio phone onboarding preflight');
  console.log('=================================');
  console.log(`Mode: ${result.mode}`);
  console.log(`Account SID: ${redactSid(result.inputs.accountSid)}`);
  console.log(`Phone number: ${result.inputs.fromNumber || '(missing)'}`);
  console.log(`Webhook URL: ${result.inputs.webhookUrl || '(missing)'}`);
  console.log('');

  if (result.errors.length) {
    console.log('Blocked:');
    for (const error of result.errors) console.log(`- ${error}`);
    console.log('');
    console.log(usage());
    return;
  }

  for (const check of result.checks) {
    console.log(`${check.ok ? '✓' : '✗'} ${check.name}${check.detail ? ` — ${check.detail}` : ''}`);
  }

  console.log('');
  if (result.mode === 'apply') {
    console.log(result.updated ? 'Twilio VoiceUrl updated.' : 'Twilio VoiceUrl was not updated.');
  } else {
    console.log('Dry run only. To update Twilio, rerun with:');
    console.log('  VOICE_CALL_LIVE_MODE=true node src/phone/twilio-onboarding.mjs --apply --yes');
  }

  console.log('');
  console.log('OpenClaw voice-call config snippet:');
  console.log(JSON.stringify(result.openClawConfigSnippet, null, 2));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(usage());
    return;
  }

  const inputs = validateInputs();
  const result = {
    mode: args.apply ? 'apply' : (args.offline ? 'offline-preflight' : 'preflight'),
    updated: false,
    inputs: {
      accountSid: inputs.accountSid,
      fromNumber: inputs.fromNumber,
      webhookUrl: inputs.webhookUrl,
      statusCallbackUrl: inputs.statusCallbackUrl || undefined
    },
    checks: [],
    errors: [...inputs.errors],
    openClawConfigSnippet: inputs.errors.length ? null : buildConfigSnippet(inputs)
  };

  if (args.apply && !args.yes) result.errors.push('--apply requires --yes.');
  if (args.apply && !isLiveMode()) result.errors.push('--apply requires VOICE_CALL_LIVE_MODE=true.');

  if (!result.errors.length && !args.offline) {
    try {
      const incomingNumber = await findIncomingNumber({
        accountSid: inputs.accountSid,
        authToken: inputs.authToken,
        phoneNumber: inputs.fromNumber
      });
      if (!incomingNumber) {
        result.errors.push(`Twilio account does not show ${inputs.fromNumber} as an incoming phone number.`);
      } else {
        result.checks.push({ ok: true, name: 'Twilio number ownership', detail: `number SID ${incomingNumber.sid}` });
        result.checks.push({ ok: true, name: 'Current Twilio VoiceUrl', detail: incomingNumber.voice_url || '(empty)' });

        if (args.apply) {
          const updated = await updateIncomingNumberWebhook({
            accountSid: inputs.accountSid,
            authToken: inputs.authToken,
            numberSid: incomingNumber.sid,
            webhookUrl: inputs.webhookUrl,
            statusCallbackUrl: inputs.statusCallbackUrl
          });
          result.updated = true;
          result.checks.push({ ok: true, name: 'Updated Twilio VoiceUrl', detail: updated.voice_url });
        }
      }
    } catch (error) {
      result.errors.push(error.message);
    }
  } else if (!result.errors.length) {
    result.checks.push({ ok: true, name: 'Offline input validation', detail: 'Skipped Twilio API lookup.' });
  }

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printHuman(result);
  }

  if (result.errors.length) process.exit(1);
}

main().catch(error => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
