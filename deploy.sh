#!/bin/bash
# Deploy to Fly.io: load env from .env, set Fly secrets (runtime), then deploy with build args
set -e

ENV_FILE="${1:-.env}"
REQUIRED_VARS=(
  CONVEX_DEPLOYMENT
  NEXT_PUBLIC_CONVEX_URL
  NEXT_PUBLIC_CONVEX_SITE_URL
  NEXT_PUBLIC_SITE_URL
  BUCKET_NAME
  BUCKET_REGION
  NEXT_PUBLIC_DIST_DOMAIN_NAME
)

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE not found."
  echo "Required: ${REQUIRED_VARS[*]}"
  exit 1
fi

# Load required vars from .env (avoids errors from other .env lines like "KEY: value")
while IFS= read -r line; do
  line="${line%%#*}"
  line="${line%"${line##*[![:space:]]}"}"
  line="${line#"${line%%[![:space:]]*}"}"
  [[ -z "$line" ]] && continue
  for var in "${REQUIRED_VARS[@]}"; do
    if [[ "$line" =~ ^${var}= ]]; then
      export "$line"
      break
    fi
  done
done < "$ENV_FILE"

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "Error: $var is not set in $ENV_FILE"
    exit 1
  fi
  # echo "  $var: set"
  echo "$var=${!var}"
done
echo "Deploying from $ENV_FILE..."

# Set all as Fly secrets (available at runtime in the app)
fly secrets set \
  "CONVEX_DEPLOYMENT=$CONVEX_DEPLOYMENT" \
  "NEXT_PUBLIC_CONVEX_URL=$NEXT_PUBLIC_CONVEX_URL" \
  "NEXT_PUBLIC_CONVEX_SITE_URL=$NEXT_PUBLIC_CONVEX_SITE_URL" \
  "NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL" \
  "BUCKET_NAME=$BUCKET_NAME" \
  "BUCKET_REGION=$BUCKET_REGION" \
  "NEXT_PUBLIC_DIST_DOMAIN_NAME=$NEXT_PUBLIC_DIST_DOMAIN_NAME"

# Deploy with NEXT_PUBLIC_* as build args (inlined into client bundle at build time)
fly deploy \
  --build-arg NEXT_PUBLIC_CONVEX_URL="$NEXT_PUBLIC_CONVEX_URL" \
  --build-arg NEXT_PUBLIC_CONVEX_SITE_URL="$NEXT_PUBLIC_CONVEX_SITE_URL" \
  --build-arg NEXT_PUBLIC_SITE_URL="$NEXT_PUBLIC_SITE_URL" \
  --build-arg NEXT_PUBLIC_DIST_DOMAIN_NAME="$NEXT_PUBLIC_DIST_DOMAIN_NAME"
