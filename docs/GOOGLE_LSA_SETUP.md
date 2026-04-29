# Google Local Services Ads Setup

## What the API can support

The Google Ads API includes Local Services lead resources for lead data and a Local Services Lead Service method for appending lead conversations.

Important implementation notes:

- `LocalServicesLead` contains generated lead data such as resource name, ID, contact details, lead type/status, category/service, and creation time.
- `LocalServicesLeadConversation` represents interaction history and includes channel, participant, associated lead, and message/phone details.
- `AppendLeadConversation` appends text to Local Services leads and requires the `https://www.googleapis.com/auth/adwords` OAuth scope.
- The REST endpoint pattern is:

```text
POST https://googleads.googleapis.com/v{VERSION}/customers/{customerId}/localServices:appendLeadConversation
```

Body:

```json
{
  "conversations": [
    {
      "localServicesLead": "customers/{customerId}/localServicesLeads/{leadId}",
      "text": "Thanks for reaching out — we received your request and will follow up shortly."
    }
  ]
}
```

## Required headers

Typical REST headers:

```text
Authorization: Bearer <oauth_access_token>
developer-token: <google_ads_developer_token>
login-customer-id: <manager_customer_id>   # when using MCC/manager account
Content-Type: application/json
```

## Read-only test first

Use `googleAds:searchStream` or an official Google Ads client library to retrieve recent leads before appending anything.

## Live reply rule

Do not append a message unless:

- The lead is new or awaiting response.
- The script is approved.
- The message is true and does not overpromise.
- The agent logs the action in HubSpot.
