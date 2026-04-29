export function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export function liveMode() {
  return String(process.env.ROOFCLAW_SALES_LIVE_MODE || '').toLowerCase() === 'true';
}

export function hubspotConfig() {
  return {
    token: requireEnv('HUBSPOT_PRIVATE_APP_TOKEN'),
    pipelineId: process.env.HUBSPOT_DEAL_PIPELINE_ID,
    dealStageId: process.env.HUBSPOT_NEW_LEAD_DEAL_STAGE_ID,
    ownerId: process.env.HUBSPOT_OWNER_ID
  };
}

export function googleAdsConfig() {
  return {
    version: process.env.GOOGLE_ADS_API_VERSION || 'v22',
    customerId: requireEnv('GOOGLE_ADS_CUSTOMER_ID'),
    loginCustomerId: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
    developerToken: requireEnv('GOOGLE_ADS_DEVELOPER_TOKEN'),
    accessToken: requireEnv('GOOGLE_ADS_ACCESS_TOKEN')
  };
}
