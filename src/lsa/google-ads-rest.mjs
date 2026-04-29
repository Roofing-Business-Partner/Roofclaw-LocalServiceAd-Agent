import { googleAdsConfig } from '../config.mjs';

function headers(config) {
  const base = {
    Authorization: `Bearer ${config.accessToken}`,
    'developer-token': config.developerToken,
    'Content-Type': 'application/json'
  };
  if (config.loginCustomerId) base['login-customer-id'] = config.loginCustomerId.replaceAll('-', '');
  return base;
}

export async function googleAdsSearchStream({ query, config = googleAdsConfig() }) {
  const customerId = config.customerId.replaceAll('-', '');
  const url = `https://googleads.googleapis.com/${config.version}/customers/${customerId}/googleAds:searchStream`;
  const response = await fetch(url, {
    method: 'POST',
    headers: headers(config),
    body: JSON.stringify({ query })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Google Ads searchStream failed: ${response.status} ${JSON.stringify(data)}`);
  }
  return data;
}

export async function appendLeadConversation({ leadResourceName, text, config = googleAdsConfig() }) {
  if (!leadResourceName) throw new Error('leadResourceName is required');
  if (!text || text.trim().length < 2) throw new Error('text is required');

  const customerId = config.customerId.replaceAll('-', '');
  const url = `https://googleads.googleapis.com/${config.version}/customers/${customerId}/localServices:appendLeadConversation`;

  const response = await fetch(url, {
    method: 'POST',
    headers: headers(config),
    body: JSON.stringify({
      conversations: [
        {
          localServicesLead: leadResourceName,
          text
        }
      ]
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`AppendLeadConversation failed: ${response.status} ${JSON.stringify(data)}`);
  }
  return data;
}
