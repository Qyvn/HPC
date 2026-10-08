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

## Coach (`/today`)

Netlify function: `netlify/functions/coach.js`.

Set one AI key in the Netlify site env (Site settings → Environment variables), then redeploy:

| Variable | Required | Notes |
|----------|----------|--------|
| `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` | one of them | AI provider key |
| `COACH_MODEL` | no | defaults `gpt-4o-mini` or `claude-3-5-haiku-latest` |
| `COACH_RATE_LIMIT` | no | max requests per device per 24h (default `20`) |

Also used by ops CRM: `NETLIFY_ACCESS_TOKEN`, `OPS_PASSWORD`.

Without an AI key the function still returns a short local fallback reply so the panel does not go blank.

## Domain email

See **EMAIL.md** for ImprovMX / Microsoft 365 setup so `apply@highperformersclub.co.za` receives mail.
