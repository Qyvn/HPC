# High Performers Club

Marketing site for High Performers Club — an elite athletic club for entrepreneurs, athletes, and operators.

## Live

**Production:** https://highperformersclub.co.za  
**Fallback:** https://high-performers-club.netlify.app  
**Admin:** https://app.netlify.com/projects/high-performers-club

### Applications (Apply form)

Until a full CRM (HubSpot) is connected, applications land in two places:

1. **Email alert** → `highperfomersclub@outlook.com` (subject: “New High Performers Club application”)
2. **Netlify inbox** → [Forms → apply](https://app.netlify.com/projects/high-performers-club/forms)

Form fields: name, email, lane, why.

Redeploy after changes: `npx netlify deploy --prod --dir=.` (or connect continuous deploy from GitHub in the Netlify UI).

## Other hosting options

### Option A — GitHub Pages (free)
Repo already has a `gh-pages` deploy branch and an Actions workflow.

**Enable once (repo owner):**
1. Open https://github.com/Qyvn/HPC/settings/pages  
2. Under **Build and deployment → Source**, choose either:
   - **Deploy from a branch** → Branch: `gh-pages` → Folder: `/ (root)` → Save  
   - **or** **GitHub Actions** (uses `.github/workflows/deploy-pages.yml`)
3. Site URL: **https://qyvn.github.io/HPC/**

Optional custom domain: same Pages settings → Custom domain → `yourdomain.com`

### Option B — Netlify (free, great for waitlist forms later)
1. Go to https://app.netlify.com/start  
2. **Import from Git** → choose `Qyvn/HPC`  
3. Build command: leave blank / use `netlify.toml`  
4. Publish directory: `.`  
5. Deploy — you get a `*.netlify.app` URL, then add your domain

### Option C — Vercel (free)
1. Go to https://vercel.com/new  
2. Import `Qyvn/HPC`  
3. Framework: Other · Root: `.`  
4. Deploy — you get a `*.vercel.app` URL

## Local preview

```bash
python3 -m http.server 8765
```

Visit http://127.0.0.1:8765/
