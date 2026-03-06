.PHONY: help dev dev-logs dev-down dev-rebuild dev-clean prod prod-logs prod-down prod-rebuild \
         db-shell db-migrate db-migrate-revert db-generate db-seed db-seed-validate db-seed-credits db-sync-credits db-backup db-restore db-reset \
         ps status ps-prod logs logs-prod build build-prod up down logs-all images clean

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Environment
ENV_FILE := .env.docker
ENV_FILE_PROD := .env.docker.prod
COMPOSE_CMD := docker-compose --env-file $(ENV_FILE)
COMPOSE_PROD := docker-compose -f docker-compose.prod.yml --env-file $(ENV_FILE_PROD)

help: ## Show this help message
	@echo "$(BLUE)═══════════════════════════════════════════════════════════$(NC)"
	@echo "$(BLUE)Debt Tracker - Docker & Database Commands$(NC)"
	@echo "$(BLUE)═══════════════════════════════════════════════════════════$(NC)\n"
	@echo "$(GREEN)Development Commands:$(NC)"
	@grep -E '^\s*dev.*:.*##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*##"}; {printf "  $(GREEN)%-25s$(NC) %s\n", $$1, $$2}'
	@echo "\n$(GREEN)Database Commands:$(NC)"
	@grep -E '^\s*db-.*:.*##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*##"}; {printf "  $(GREEN)%-25s$(NC) %s\n", $$1, $$2}'
	@echo "\n$(GREEN)Production Commands:$(NC)"
	@grep -E '^\s*prod.*:.*##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*##"}; {printf "  $(GREEN)%-25s$(NC) %s\n", $$1, $$2}'
	@echo "\n$(GREEN)Container Commands:$(NC)"
	@grep -E '^\s*(ps|status|logs|images|up|down|build|clean):.*##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*##"}; {printf "  $(GREEN)%-25s$(NC) %s\n", $$1, $$2}'
	@echo "\n$(BLUE)═══════════════════════════════════════════════════════════$(NC)\n"

# ============================================================================
# DEVELOPMENT COMMANDS
# ============================================================================

dev: env-check ## Start development environment with all services
	@echo "$(BLUE)🚀 Starting Debt Tracker development environment...$(NC)"
	@$(COMPOSE_CMD) up -d
	@echo "$(GREEN)✅ Development environment started$(NC)"
	@echo "$(YELLOW)App:     http://localhost:3000$(NC)"
	@echo "$(YELLOW)pgAdmin: http://localhost:5050$(NC)"
	@echo "$(YELLOW)Database: localhost:5432$(NC)"

dev-logs: ## View development logs (follow mode)
	@$(COMPOSE_CMD) logs -f

dev-logs-app: ## View only app logs
	@$(COMPOSE_CMD) logs -f app

dev-logs-db: ## View only database logs
	@$(COMPOSE_CMD) logs -f postgres

dev-down: ## Stop development environment
	@echo "$(BLUE)⏹️  Stopping development environment...$(NC)"
	@$(COMPOSE_CMD) down
	@echo "$(GREEN)✅ Development environment stopped$(NC)"

dev-rebuild: ## Rebuild development containers without cache
	@echo "$(BLUE)🔨 Rebuilding development containers...$(NC)"
	@$(COMPOSE_CMD) build --no-cache
	@$(COMPOSE_CMD) up -d
	@echo "$(GREEN)✅ Containers rebuilt and started$(NC)"

dev-clean: ## Stop and remove all development containers/volumes
	@echo "$(RED)⚠️  This will DELETE your database data!$(NC)"
	@read -p "Continue? (y/N) " confirm && [ "$$confirm" = "y" ] || exit 1
	@$(COMPOSE_CMD) down -v
	@echo "$(GREEN)✅ Development environment cleaned$(NC)"

# ============================================================================
# DATABASE COMMANDS
# ============================================================================

db-shell: ## Open PostgreSQL shell in development
	@echo "$(BLUE)🔌 Connecting to database...$(NC)"
	@$(COMPOSE_CMD) exec postgres psql -U postgres -d debt_tracker

db-seed: env-check ## Import data from Google Sheets
	@echo "$(BLUE)📥 Importing data from Google Sheets...$(NC)"
	@npm run db:seed
	@echo "$(GREEN)✅ Data import completed$(NC)"

db-seed-credits: env-check ## Import credits from Google Sheets
	@echo "$(BLUE)📥 Importing credits from Google Sheets...$(NC)"
	@npx ts-node -r tsconfig-paths/register src/database/seeds/importCreditsFromSheets.ts
	@echo "$(GREEN)✅ Credits import completed$(NC)"

db-sync-credits: env-check ## Sync new credits from Google Sheets (skips existing records)
	@echo "$(BLUE)🔄 Syncing new credits from Google Sheets...$(NC)"
	@npx ts-node -r tsconfig-paths/register src/database/seeds/syncNewCreditsFromSheets.ts
	@echo "$(GREEN)✅ Credits sync completed$(NC)"

db-backup: ## Backup database to SQL file
	@echo "$(BLUE)💾 Backing up database...$(NC)"
	@mkdir -p backups
	@$(COMPOSE_CMD) exec postgres pg_dump -U postgres -d debt_tracker > backups/backup-$$(date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✅ Database backed up$(NC)"

db-restore: ## Restore database from latest backup
	@echo "$(BLUE)📂 Restoring database...$(NC)"
	@read -p "Enter backup file name (in backups/ folder): " file && \
	cat backups/$$file | $(COMPOSE_CMD) exec -T postgres psql -U postgres
	@echo "$(GREEN)✅ Database restored$(NC)"

db-reset: ## Reset database (drop and recreate)
	@echo "$(RED)⚠️  This will DELETE all database data!$(NC)"
	@read -p "Continue? (y/N) " confirm && [ "$$confirm" = "y" ] || exit 1
	@$(COMPOSE_CMD) exec postgres psql -U postgres -c "DROP DATABASE IF EXISTS debt_tracker;"
	@$(COMPOSE_CMD) exec postgres psql -U postgres -c "CREATE DATABASE debt_tracker;"
	@$(MAKE) db-migrate
	@echo "$(GREEN)✅ Database reset and tables created$(NC)"

# ============================================================================
# PRODUCTION COMMANDS
# ============================================================================

prod: env-check-prod ## Start production environment
	@echo "$(BLUE)🚀 Starting Debt Tracker production environment...$(NC)"
	@$(COMPOSE_PROD) up -d
	@echo "$(GREEN)✅ Production environment started$(NC)"
	@echo "$(YELLOW)App: http://localhost:3000 (local only)$(NC)"

prod-logs: ## View production logs
	@$(COMPOSE_PROD) logs -f

prod-logs-app: ## View only production app logs
	@$(COMPOSE_PROD) logs -f app

prod-logs-db: ## View only production database logs
	@$(COMPOSE_PROD) logs -f postgres

prod-down: ## Stop production environment
	@echo "$(BLUE)⏹️  Stopping production environment...$(NC)"
	@$(COMPOSE_PROD) down
	@echo "$(GREEN)✅ Production environment stopped$(NC)"

prod-rebuild: ## Rebuild production containers without cache
	@echo "$(BLUE)🔨 Rebuilding production containers...$(NC)"
	@$(COMPOSE_PROD) build --no-cache
	@$(COMPOSE_PROD) up -d
	@echo "$(GREEN)✅ Production containers rebuilt and started$(NC)"

# ============================================================================
# CONTAINER COMMANDS
# ============================================================================

ps: ## Show running containers (development)
	@$(COMPOSE_CMD) ps

ps-prod: ## Show running containers (production)
	@$(COMPOSE_PROD) ps

status: ## Show detailed status of development services
	@echo "$(BLUE)📊 Development Services Status:$(NC)"
	@$(COMPOSE_CMD) ps
	@echo "\n$(BLUE)Health Checks:$(NC)"
	@$(COMPOSE_CMD) exec -T postgres pg_isready -U postgres && echo "$(GREEN)✅ Database: Healthy$(NC)" || echo "$(RED)❌ Database: Unhealthy$(NC)"
	@$(COMPOSE_CMD) exec -T app curl -s http://localhost:3000/health > /dev/null && echo "$(GREEN)✅ App: Healthy$(NC)" || echo "$(YELLOW)⚠️  App: No health check$(NC)"

logs: ## View all development logs
	@$(COMPOSE_CMD) logs

logs-all: ## View all logs including build output
	@$(COMPOSE_CMD) logs --timestamps

images: ## List Docker images
	@docker images | grep -E "debt-tracker|postgres|node" || echo "No images found"

up: dev ## Alias for 'dev' - start environment

down: dev-down ## Alias for 'dev-down' - stop environment

build: ## Build development Docker image
	@echo "$(BLUE)🔨 Building Docker image...$(NC)"
	@$(COMPOSE_CMD) build
	@echo "$(GREEN)✅ Build completed$(NC)"

build-prod: ## Build production Docker image
	@echo "$(BLUE)🔨 Building production Docker image...$(NC)"
	@$(COMPOSE_PROD) build
	@echo "$(GREEN)✅ Production build completed$(NC)"

# ============================================================================
# UTILITY COMMANDS
# ============================================================================

env-check: ## Check if environment variables are set
	@if [ ! -f "$(ENV_FILE)" ]; then \
		echo "$(YELLOW)⚠️  $(ENV_FILE) not found. Creating from defaults...$(NC)"; \
		if [ -f ".env.example" ]; then \
			cp .env.example $(ENV_FILE); \
			echo "$(GREEN)✅ Created $(ENV_FILE)$(NC)"; \
		else \
			echo "$(RED)❌ .env.example not found$(NC)"; \
			exit 1; \
		fi; \
	fi

env-check-prod: ## Check if production environment variables are set
	@if [ ! -f "$(ENV_FILE_PROD)" ]; then \
		echo "$(YELLOW)⚠️  $(ENV_FILE_PROD) not found$(NC)"; \
		exit 1; \
	fi

clean: ## Remove containers, images, and volumes (WARNING: destructive)
	@echo "$(RED)⚠️  This will DELETE containers, images, and volumes!$(NC)"
	@read -p "Continue? (y/N) " confirm && [ "$$confirm" = "y" ] || exit 1
	@echo "$(BLUE)🧹 Cleaning Docker resources...$(NC)"
	@docker system prune -af
	@echo "$(GREEN)✅ Docker resources cleaned$(NC)"

format: ## Format Makefile help
	@echo "$(BLUE)Makefile is properly formatted$(NC)"

shell: ## Open interactive shell in app container
	@echo "$(BLUE)📱 Opening shell in app container...$(NC)"
	@$(COMPOSE_CMD) exec app /bin/sh

.DEFAULT_GOAL := help
