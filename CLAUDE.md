# Hosting

Production runs on **Cloudflare Workers static assets** (worker `svsguvenlik`, account of mehditerzi.com).
Moved off the home-server Docker container + Cloudflare Tunnel on 2026-10-22 so the site stays up
if that Mac goes down. There is **no Docker container for this site anymore** — don't recreate one,
and don't point DNS back at the tunnel.

- Domains: svsguvenlik.mehditerzi.com (attached as Workers Custom Domains)
- Preview URL: https://svsguvenlik.mehditerzi32.workers.dev
- Config: `wrangler.jsonc` (assets dir `./.output/public`)
- Security headers: `public/_headers`

## Deploy

```sh
npm install && npx nuxt generate   # static output in .output/public
set -a; source ~/deploy-control/.env; set +a   # CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID
npx --yes wrangler@4 deploy
```

The site is fully static — no server routes, env vars or database at runtime. If a feature needs a
backend (form handler, API), it has to become a Worker script; there is no Node server anymore.
Machine-wide context (other sites, tunnel, Docker): `~/.claude/CLAUDE.md`.

Rollback (only if Cloudflare is unusable): the old self-host image can be rebuilt from the Dockerfile in
this repo; it was served via the `flare` tunnel (ingress entry still present) on the shared `edge_net` network.
