# Safety and Compliance Guardrails

This repo helps implement sales automation. It does not replace legal review.

## Required guardrails

- Identify whether AI disclosure is required in the client's jurisdiction and channel.
- Identify whether call recording disclosure is required.
- Define text/SMS consent and opt-out handling.
- Respect do-not-contact instructions immediately.
- Do not imply emergency service availability unless approved.
- Do not promise pricing, financing, discounts, warranties, or arrival times without explicit rules.
- Escalate angry customers, legal threats, insurance disputes, cancellations, refunds, and safety-sensitive scenarios.

## Suggested escalation triggers

Escalate immediately if the lead mentions:

- Injury or active property danger
- Lawsuit, attorney, insurance dispute, public complaint
- Warranty claim
- Refund/chargeback
- Price objection requiring discount authority
- Same-day emergency beyond approved service rules
- Abuse, threats, or harassment
- Ambiguous request the agent cannot confidently classify

## Logging rule

Log enough for business continuity, not enough to create unnecessary privacy risk.

Never log credentials, payment card data, private access links, or unnecessary personal details.
