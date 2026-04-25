# Authority alerts: scheduling

The alert engine and digest sender are HTTP endpoints that need to be
invoked on a schedule. This project does not have `pg_net` installed, so
calling them from `pg_cron` is not currently possible without an
intermediate trigger.

## Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/authority/alerts/evaluate` | POST | Run all evaluators for every verified authority and insert new alerts |
| `/api/authority/alerts/digest?period=daily` | POST | Send the daily digest to authorities configured for daily cadence |
| `/api/authority/alerts/digest?period=weekly` | POST | Send the weekly digest to authorities configured for weekly cadence |

All three endpoints require `Authorization: Bearer ${CRON_SECRET}` in
production. `CRON_SECRET` must be set in the Vercel project (already used
by the bursary reminder job in `app/api/reminders/send/route.ts`).

## Recommended schedule

| Job | Cadence | Time (UTC) |
|---|---|---|
| `evaluate` | Daily | 06:00 |
| `digest?period=daily` | Weekdays | 07:00 |
| `digest?period=weekly` | Mondays | 07:00 |

## Wiring options

### Option 1: Vercel cron (preferred)

Add to `vercel.json`:

```json
{
  "crons": [
    { "path": "/api/authority/alerts/evaluate", "schedule": "0 6 * * *" },
    { "path": "/api/authority/alerts/digest?period=daily", "schedule": "0 7 * * 1-5" },
    { "path": "/api/authority/alerts/digest?period=weekly", "schedule": "0 7 * * 1" }
  ]
}
```

Vercel cron POSTs to the path with no body. Verify the platform sends
`Authorization: Bearer ${CRON_SECRET}` automatically (Vercel supports
this via `CRON_SECRET` env var by convention; if not, configure a
custom auth header).

### Option 2: Supabase Edge Function + pg_cron

Create a Supabase Edge Function that does:

```typescript
const cronSecret = Deno.env.get('CRON_SECRET')
const siteUrl = Deno.env.get('SITE_URL') || 'https://pathfinderscot.co.uk'
await fetch(`${siteUrl}/api/authority/alerts/evaluate`, {
  method: 'POST',
  headers: { authorization: `Bearer ${cronSecret}` },
})
```

Then schedule it via pg_cron:

```sql
SELECT cron.schedule(
  'authority-alerts-evaluate',
  '0 6 * * *',
  $$SELECT net.http_post(...)$$  -- requires pg_net
);
```

This requires `pg_net` to be enabled. If unavailable, schedule the Edge
Function directly via Supabase's scheduled triggers UI.

### Option 3: Manual or external scheduler

Curl from any external scheduler (GitHub Actions, EasyCron, etc.):

```bash
curl -X POST https://pathfinderscot.co.uk/api/authority/alerts/evaluate \
  -H "Authorization: Bearer $CRON_SECRET"
```

## Observability

Each call returns a JSON summary:

```json
{
  "ok": true,
  "authorities": 2,
  "inserted": 5,
  "skipped_dedup": 12,
  "skipped_quiet_period": 0,
  "nudges_sent": 1,
  "errors": [],
  "results": [...]
}
```

Digest dispatches are logged to `authority_audit_log` with
`action = 'alert_digest_sent'` and the per-authority send counts in
`filters_applied`.
