# nguyen-portfolio-chat (Cloudflare Worker)

Backend for the portfolio chat widget. Calls Groq for replies; debounces 2 minutes of inactivity then sends the full transcript to Telegram.

## Deploy

```bash
cd worker
pnpm install      # or npm install
npx wrangler login
npx wrangler secret put GROQ_API_KEY
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_CHAT_ID
npx wrangler deploy
```

The deploy URL is the value to set as `NEXT_PUBLIC_CHAT_ENDPOINT` in the portfolio env (append `/chat`).

## Local dev

```bash
cp .dev.vars.example .dev.vars   # fill in secrets
npx wrangler dev
```

## Routes

- `POST /chat` — body `{ sessionId, message }` → `{ reply }`. CORS-allowed for `ALLOWED_ORIGIN` and `localhost`.

## Telegram debounce

Each session is a Durable Object with an alarm. Every message reschedules the alarm to `now + 2min`. When it fires, the DO POSTs the transcript to `https://api.telegram.org/bot<TOKEN>/sendMessage` and clears state.

## Maintenance

- Bio drift: edit `src/bio.ts`, redeploy.
- Cache version: not used (no SW).
- Removal: `npx wrangler delete`. Done.
