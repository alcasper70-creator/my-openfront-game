# Vercel browser deployment with multiplayer

This project is already a browser game. Its multiplayer server is a persistent
Node/WebSocket process that keeps each live game's state in memory. Vercel is
appropriate for the static browser shell, but it cannot host that process.

Deploy the repository in two places:

1. Deploy the included `Dockerfile` to a container host that supports
   long-lived WebSockets (for example Railway, Render, Fly.io, or a VPS).
2. Import the same GitHub repository into Vercel. The included `vercel.json`
   builds the browser shell and routes share links back to the application.

## Vercel environment variables

Set these in the Vercel project before deploying:

| Variable | Value |
| --- | --- |
| `GAME_SERVER_HOST` | Your multiplayer container hostname only, for example `game.example.com` |
| `GAME_ENV` | `prod` |
| `DOMAIN` | Your Vercel browser hostname, for example `my-game.vercel.app` |
| `TURNSTILE_SITE_KEY` | Your Cloudflare Turnstile site key, or the documented test key while developing |
| `GIT_COMMIT` | Any build label, for example `vercel` |

`GAME_SERVER_HOST` is deliberately not a secret. It is embedded in the
browser shell so lobby and in-game WebSockets reach the multiplayer service.

## Multiplayer container variables

Set these on the Docker/container host. Replace the sample hostnames with
yours:

```text
GAME_ENV=prod
DOMAIN=my-game.vercel.app
SITE_HOST=my-game.vercel.app
GAME_HOST=game.example.com
INSTANCE_LETTER=a
NUM_WORKERS=2
TURNSTILE_SITE_KEY=your-turnstile-site-key
GIT_COMMIT=your-git-commit
API_KEY=the-key-for-your-compatible-api-service
```

The container needs HTTPS and WebSocket upgrade support on `GAME_HOST`.
`SITE_HOST` allows its API routes to accept requests made by the Vercel page;
without it, browser CORS protection will block game creation and lobby actions.

## API-dependent features

This repository contains the client and game server, but not the separate API
service used for accounts, signed player tokens, Turnstile verification,
ranked matchmaking, profiles, purchases, archives, and cosmetics. A fully
independent production clone needs a compatible API service and its `API_KEY`;
the game server obtains its signing keys and these endpoints from
`https://api.<DOMAIN>`. This is separate from Vercel and from the Docker game
server.

## Important limitation

Do not deploy only to Vercel and expect multiplayer to work: Vercel Functions
do not provide a persistent WebSocket server or durable in-memory match loop.
Keeping the Docker service running is required for the same multiplayer game.
