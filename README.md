# High Performers Club

Marketing site for High Performers Club — an elite athletic club for entrepreneurs, athletes, and operators.

## Live

**Production:** https://highperformersclub.co.za  
**Fallback:** https://high-performers-club.netlify.app  
**Admin:** https://app.netlify.com/projects/high-performers-club  
**Privacy:** https://highperformersclub.co.za/privacy  
**Ops CRM:** https://highperformersclub.co.za/ops  
**VÉRO store:** https://highperformersclub.co.za/vero/  

### Applications

1. **Email alert** → `highperformersclub@outlook.com` (Netlify Forms notification)  
2. **Brand address on site** → `apply@highperformersclub.co.za` (see `EMAIL.md` to activate inbox)  
3. **CRM board** → [/ops](https://highperformersclub.co.za/ops) pipeline  
4. **Netlify inbox** → [Forms → apply](https://app.netlify.com/projects/high-performers-club/forms)

Form fields: name, email, lane, why.

Redeploy after changes: `npx netlify deploy --prod --dir=.`

## VÉRO

The VÉRO e-commerce app is isolated under `/vero/` so the HPC homepage and ops tools stay unchanged.

- Source: `vero-store/`
- Published build: `vero/`
- Rebuild notes: see `vero-store/README.md`

## Domain email

See **EMAIL.md** for ImprovMX / Microsoft 365 setup so `apply@highperformersclub.co.za` receives mail.
