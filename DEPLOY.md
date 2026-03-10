# Deploy to Fly.io

## Prerequisites

1. **Install flyctl**: [fly.io/docs/flyctl/install](https://fly.io/docs/flyctl/install)
2. **Sign in**: `fly auth login`

## First-time setup

If the app doesn't exist yet:

```bash
fly launch
```

Answer the prompts (or accept defaults). This creates the app and `fly.toml`.

## Deploy

### Option 1: Using the deploy script (recommended)

The script reads from `.env` (or a path you pass), sets all listed vars as **Fly secrets** (runtime), then runs `fly deploy` with the `NEXT_PUBLIC_*` vars as build args:

```bash
./deploy.sh
```

Or with a custom env file:

```bash
./deploy.sh .env.local
```

**Required vars in `.env`:**

| Var                            | Purpose                         |
| ------------------------------ | ------------------------------- |
| `CONVEX_DEPLOYMENT`            | Convex deployment               |
| `NEXT_PUBLIC_CONVEX_URL`       | Convex deployment URL           |
| `NEXT_PUBLIC_CONVEX_SITE_URL`  | Convex site URL                 |
| `NEXT_PUBLIC_SITE_URL`         | App URL                         |
| `BUCKET_NAME`                  | S3/storage bucket name          |
| `BUCKET_REGION`                | Bucket region                   |
| `NEXT_PUBLIC_DIST_DOMAIN_NAME` | Public domain for static assets |

### Option 2: Manual deploy

```bash
fly deploy \
  --build-arg NEXT_PUBLIC_CONVEX_URL="your-convex-url" \
  --build-arg NEXT_PUBLIC_CONVEX_SITE_URL="your-convex-site-url" \
  --build-arg NEXT_PUBLIC_SITE_URL="your-public-site-url" \
  --build-arg NEXT_PUBLIC_DIST_DOMAIN_NAME="your-assets-domain"
```

The deploy script sets all of the required vars as Fly secrets automatically. To set or change a secret by hand:

```bash
fly secrets set SECRET_NAME=value
```

## Useful commands

| Command           | Description         |
| ----------------- | ------------------- |
| `fly status`      | App status          |
| `fly logs`        | Tail logs           |
| `fly open`        | Open app in browser |
| `fly ssh console` | SSH into the VM     |
