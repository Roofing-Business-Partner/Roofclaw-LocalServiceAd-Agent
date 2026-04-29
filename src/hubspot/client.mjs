const BASE = 'https://api.hubapi.com';

export async function hubspotRequest(path, { method = 'GET', token, body } = {}) {
  if (!token) throw new Error('HubSpot token is required');
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.message || response.statusText;
    throw new Error(`HubSpot ${method} ${path} failed: ${response.status} ${message}`);
  }

  return data;
}

export async function searchContactByEmail({ token, email }) {
  if (!email) return null;
  const data = await hubspotRequest('/crm/v3/objects/contacts/search', {
    method: 'POST',
    token,
    body: {
      filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }],
      properties: ['email', 'firstname', 'lastname', 'phone'],
      limit: 1
    }
  });
  return data.results?.[0] || null;
}

export async function upsertContact({ token, properties }) {
  const existing = properties.email ? await searchContactByEmail({ token, email: properties.email }) : null;
  if (existing) {
    return hubspotRequest(`/crm/v3/objects/contacts/${existing.id}`, {
      method: 'PATCH',
      token,
      body: { properties }
    });
  }
  return hubspotRequest('/crm/v3/objects/contacts', {
    method: 'POST',
    token,
    body: { properties }
  });
}

export async function createDeal({ token, properties }) {
  return hubspotRequest('/crm/v3/objects/deals', {
    method: 'POST',
    token,
    body: { properties }
  });
}

export async function associateDefault({ token, fromType, fromId, toType, toId }) {
  const currentPath = `/crm/objects/2026-03/${fromType}/${fromId}/associations/default/${toType}/${toId}`;
  try {
    return await hubspotRequest(currentPath, { method: 'PUT', token });
  } catch (error) {
    // HubSpot accounts/libraries may still support the legacy CRM v4 path.
    // Keep this fallback so the launchpad remains usable while HubSpot's docs and API versions migrate.
    if (!String(error.message || '').includes('404')) throw error;
    return hubspotRequest(`/crm/v4/objects/${fromType}/${fromId}/associations/default/${toType}/${toId}`, {
      method: 'PUT',
      token
    });
  }
}
