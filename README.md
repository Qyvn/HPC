# High Performers Club

Marketing site for High Performers Club — an elite athletic club for entrepreneurs, athletes, and operators.

## Live

**Production:** https://highperformersclub.co.za  
**Fallback:** https://high-performers-club.netlify.app  
**Admin:** https://app.netlify.com/projects/high-performers-club  
**Privacy:** https://highperformersclub.co.za/privacy  
**Ops CRM:** https://highperformersclub.co.za/ops  

### Applications

1. **Email alert** → `highperformersclub@outlook.com` (Netlify Forms notification)  
2. **Brand address on site** → `apply@highperformersclub.co.za` (see `EMAIL.md` to activate inbox)  
3. **CRM board** → [/ops](https://highperformersclub.co.za/ops) pipeline  
4. **Netlify inbox** → [Forms → apply](https://app.netlify.com/projects/high-performers-club/forms)

Form fields: name, email, lane, why.

Redeploy after changes: `npx netlify deploy --prod --dir=.`

## Member login

Applicants create a password at [/join](https://highperformersclub.co.za/join), then sign in at [/login](https://highperformersclub.co.za/login).

Flow:
1. Person applies on the site (same email).
2. They create a login at `/join`.
3. Ops moves them to **Accepted** on [/ops](https://highperformersclub.co.za/ops) — that unlocks login.
4. Signed-in members sync streak dates on `/today` across devices.

Netlify env (Site settings → Environment variables):

| Variable | Required | Notes |
|----------|----------|--------|
| `MEMBER_JWT_SECRET` | yes | long random string for session cookies |
| `NETLIFY_ACCESS_TOKEN` | yes | verifies apply form email on join |
| `OPS_PASSWORD` | yes | ops CRM + stages sync |

## Domain email

See **EMAIL.md** for ImprovMX / Microsoft 365 setup so `apply@highperformersclub.co.za` receives mail.
