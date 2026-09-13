.DEFAULT_GOAL := help
ENV_FILE ?= .env.local
SNAPSHOT ?= backups/snapshot.zip
SITE_URL ?= http://localhost:3000
BUN := bun --env-file="$(ENV_FILE)"
CONVEX := $(BUN) x --bun convex

.PHONY: help install dev backend check build cloud-push auth-setup site-url seed-admin seed-demo dashboard backup migrate deploy
help:
	@echo 'install       Install locked dependencies'
	@echo 'dev / backend Run frontend / watch Convex functions'
	@echo 'check / build Check code / build frontend'
	@echo 'cloud-push    Deploy schema and functions to selected development database'
	@echo 'auth-setup    Generate auth keys once on selected database'
	@echo 'site-url      Set Convex SITE_URL (pass SITE_URL=https://your-site)'
	@echo 'seed-admin    Prompt for administrator credentials'
	@echo 'seed-demo     Add illustrative catalog data (optional)'
	@echo 'dashboard     Open selected Convex dashboard'
	@echo 'backup        Export database and files to SNAPSHOT=backups/name.zip'
	@echo 'migrate       Import SNAPSHOT into empty tables; never replace existing data'
	@echo 'deploy        Build frontend and deploy backend using CONVEX_DEPLOY_KEY'
	@echo 'Selection: ENV_FILE=.env.local (default); production: .env.production.local'

install:
	bun install --frozen-lockfile

dev:
	$(BUN) run dev

backend:
	$(CONVEX) dev

check:
	bun run typecheck
	bun run lint
	bun run test

build:
	$(BUN) run build

cloud-push:
	$(CONVEX) dev --once

auth-setup:
	$(BUN) scripts/setup-auth.ts

site-url:
	$(CONVEX) env set SITE_URL "$(SITE_URL)"

seed-admin:
	$(BUN) run seed:admin

seed-demo:
	$(CONVEX) run seed:catalog

dashboard:
	$(CONVEX) dashboard

backup:
	@mkdir -p backups
	@chmod 700 backups
	$(CONVEX) export --include-file-storage --path "$(SNAPSHOT)"

migrate:
	$(CONVEX) import "$(SNAPSHOT)"

deploy:
	$(BUN) run build:vercel

.PHONY: require-env
require-env:
	@test -f "$(ENV_FILE)" || (echo "Missing $(ENV_FILE); copy .env.example and configure the intended deployment."; exit 1)

dev backend build cloud-push auth-setup site-url seed-admin seed-demo dashboard backup migrate deploy: require-env
