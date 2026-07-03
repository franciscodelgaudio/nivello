#!/usr/bin/env bash
# Redeploy the latest code on the VM. Run from the repo root or the deploy/ dir.
set -euo pipefail

cd "$(dirname "$0")"

echo "==> Pulling latest code..."
git pull --ff-only

echo "==> Rebuilding and restarting containers..."
docker compose up -d --build

echo "==> Cleaning up dangling images..."
docker image prune -f

echo "==> Done. Current status:"
docker compose ps
