#!/usr/bin/env sh
set -eu

if [ ! -f deploy/oracle/oracle.env ]; then
  echo "Create deploy/oracle/oracle.env from oracle.env.example first." >&2
  exit 1
fi

git pull --ff-only
docker compose --env-file deploy/oracle/oracle.env \
  -f deploy/oracle/docker-compose.yml up --build --detach
