# Domain email — High Performers Club

Public brand address on the site: **apply@highperformersclub.co.za**

Form alerts still deliver to **highperformersclub@outlook.com** until domain mail is fully live.

## Make apply@ receive mail (manual — ~10 minutes)

Nameservers are still on domains.co.za (`anycast-ns`). Add MX there (or switch NS to Netlify first — MX is already staged on the Netlify DNS zone).

### Option A — Free forwarding (ImprovMX) → Outlook

1. Create a free account at https://improvmx.com  
2. Add domain: `highperformersclub.co.za`  
3. Create alias: `apply` → `highperformersclub@outlook.com`  
4. In **domains.co.za → Manage DNS**, add:

| Type | Host | Priority | Value |
|------|------|----------|--------|
| MX | `@` | 10 | `mx1.improvmx.com` |
| MX | `@` | 20 | `mx2.improvmx.com` |

5. Wait for DNS (often 15–60 min). Test by emailing `apply@highperformersclub.co.za`.

### Option B — Full mailbox (Microsoft 365)

Buy Microsoft 365 Business Basic for the domain, create `apply@highperformersclub.co.za`, then you can **send and receive** from the brand address (true premium).

## Applications CRM

Private pipeline board: https://highperformersclub.co.za/ops  

Password is set in Netlify env `OPS_PASSWORD` (shared separately). Stages: Applied → Reviewing → Accepted → Declined.
