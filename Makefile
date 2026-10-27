# Environment & Package manager
export PNPM_HOME := $(HOME)/Library/pnpm
export PATH := $(PNPM_HOME):$(PATH)
PNPM ?= pnpm

.DEFAULT_GOAL := help

.PHONY: help install i dev build preview typecheck lint lint-fix test test-unit test-e2e test-e2e-ui \
        cdn-fetch cdn-sync cdn-verify cdn-upload cdn-deploy cdn-setup clean clean-all

help: ## Show available commands
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

## ==============================================================================
## Development
## ==============================================================================

i: install ## Alias for install

install: ## Install project dependencies
	$(PNPM) install

dev: ## Start local Vite development server
	$(PNPM) dev

preview: ## Preview the production build locally
	$(PNPM) preview

## ==============================================================================
## Build & Code Quality
## ==============================================================================

build: ## Typecheck and build for production (dist/)
	$(PNPM) build

typecheck: ## Run TypeScript type checking
	$(PNPM) typecheck

lint: ## Run ESLint code checks
	$(PNPM) lint

lint-fix: ## Run ESLint and automatically fix fixable issues
	$(PNPM) lint:fix

## ==============================================================================
## Testing
## ==============================================================================

test: test-unit ## Run all unit tests

test-unit: ## Run unit tests
	$(PNPM) test:unit

test-e2e: ## Run Playwright end-to-end tests
	$(PNPM) test:e2e

test-e2e-ui: ## Run Playwright tests with interactive UI
	$(PNPM) test:e2e:ui

## ==============================================================================
## CDN Assets
## ==============================================================================

cdn-fetch: ## Fetch CDN images locally
	$(PNPM) cdn:fetch-images

cdn-sync: ## Sync images to Cloudflare R2 bucket
	$(PNPM) cdn:sync

cdn-verify: ## Verify CDN availability and links
	$(PNPM) cdn:verify

cdn-upload: ## Upload images to Cloudinary
	$(PNPM) cdn:upload

cdn-deploy: ## Deploy Cloudflare image-cdn worker
	$(PNPM) cdn:deploy

cdn-setup: ## Run full setup for CDN and storage
	$(PNPM) cdn:setup

## ==============================================================================
## Cleanup
## ==============================================================================

clean: ## Remove build artifacts (dist)
	rm -rf dist

clean-all: clean ## Remove build artifacts and node_modules
	rm -rf node_modules
