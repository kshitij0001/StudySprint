.PHONY: help install dev build start test clean deploy lint format check

# Default target
help:
	@echo "NEET 2026 Spaced Revision App - Available Commands:"
	@echo ""
	@echo "  install     - Install dependencies"
	@echo "  dev         - Start development server"
	@echo "  build       - Build for production"
	@echo "  start       - Start production server"
	@echo "  test        - Run tests"
	@echo "  check       - Run TypeScript type checking"
	@echo "  lint        - Run linter"
	@echo "  format      - Format code"
	@echo "  clean       - Clean build artifacts"
	@echo "  deploy      - Deploy to GitHub Pages"
	@echo "  backup      - Create data backup"
	@echo ""

# Install dependencies
install:
	npm ci

# Development
dev:
	npm run dev

# Build for production
build:
	npm run build

# Start production server
start:
	npm run start

# Run tests
test:
	npm run test

# TypeScript checking
check:
	npm run check

# Linting
lint:
	@echo "Linting not configured yet. Add ESLint to package.json"

# Code formatting
format:
	@echo "Formatting not configured yet. Add Prettier to package.json"

# Clean build artifacts
clean:
	rm -rf dist/
	rm -rf node_modules/.vite/

# Deploy to GitHub Pages
deploy:
	@echo "Deploying to GitHub Pages..."
	@if [ -z "$(shell git status --porcelain)" ]; then \
		git push origin main; \
		echo "Deployed! Check GitHub Actions for build status."; \
	else \
		echo "Error: Working directory not clean. Commit changes first."; \
		exit 1; \
	fi

# Create development backup
backup:
	@echo "Creating backup..."
	@mkdir -p backups
	@cp -r client/src backups/src-$(shell date +%Y%m%d-%H%M%S)
	@echo "Backup created in backups/ directory"

# Setup new environment
setup: install
	@echo "Setting up NEET 2026 app..."
	@echo "Creating .env file..."
	@echo "VITE_NEET_DATE=2026-05-03T09:00:00+05:30" > .env
	@echo "Setup complete! Run 'make dev' to start developing."

# Production build with optimizations
build-prod:
	@echo "Building for production with optimizations..."
	NODE_ENV=production npm run build
	@echo "Production build complete!"

# Quick test of build
test-build: build
	@echo "Testing production build..."
	npm run start &
	@sleep 3
	@curl -f http://localhost:5000 > /dev/null && echo "✅ Build test passed" || echo "❌ Build test failed"
	@pkill -f "npm run start" || true

# Initialize Git hooks (if using)
hooks:
	@echo "Setting up Git hooks..."
	@echo "#!/bin/sh\nmake check" > .git/hooks/pre-commit
	@chmod +x .git/hooks/pre-commit
	@echo "Git hooks installed!"

# Development helpers
reset-deps:
	rm -rf node_modules package-lock.json
	npm install

# Check for updates
update-deps:
	npm outdated
	@echo "Run 'npm update' to update dependencies"

# Bundle analysis
analyze:
	@echo "Building with bundle analysis..."
	npm run build -- --mode analyze
	@echo "Check dist/ for bundle analysis files"
