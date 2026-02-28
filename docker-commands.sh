#!/bin/bash

# Docker commands helper script
# Usage: ./docker-commands.sh [command]

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_help() {
    echo "Debt Tracker Docker Commands"
    echo "=============================="
    echo ""
    echo "Usage: ./docker-commands.sh [command]"
    echo ""
    echo "Development Commands:"
    echo "  dev              - Start development environment"
    echo "  dev-logs         - View development logs"
    echo "  dev-down         - Stop development environment"
    echo "  dev-rebuild      - Rebuild development images"
    echo "  dev-clean        - Clean all development containers and volumes"
    echo ""
    echo "Production Commands:"
    echo "  prod             - Start production environment"
    echo "  prod-logs        - View production logs"
    echo "  prod-down        - Stop production environment"
    echo "  prod-rebuild     - Rebuild production images"
    echo ""
    echo "Database Commands:"
    echo "  db-shell         - Access PostgreSQL shell (development)"
    echo "  db-backup        - Create database backup"
    echo "  db-restore       - Restore database from backup"
    echo "  db-migrate       - Run TypeORM migrations"
    echo "  db-seed          - Seed database with sample data"
    echo ""
    echo "Utility Commands:"
    echo "  ps               - Show running containers"
    echo "  status           - Show system status"
    echo "  help             - Show this help message"
}

# Development environment commands
dev_start() {
    echo -e "${GREEN}Starting development environment...${NC}"
    docker-compose --env-file .env.docker up -d
    echo -e "${GREEN}✓ Development environment started${NC}"
    echo ""
    echo "Services available:"
    echo "  App:      http://localhost:3000"
    echo "  pgAdmin:  http://localhost:5050"
    echo "  Database: localhost:5432"
}

dev_logs() {
    echo -e "${YELLOW}Showing development logs (Ctrl+C to exit)...${NC}"
    docker-compose --env-file .env.docker logs -f
}

dev_down() {
    echo -e "${YELLOW}Stopping development environment...${NC}"
    docker-compose --env-file .env.docker down
    echo -e "${GREEN}✓ Development environment stopped${NC}"
}

dev_rebuild() {
    echo -e "${YELLOW}Rebuilding development images...${NC}"
    docker-compose --env-file .env.docker build --no-cache
    echo -e "${GREEN}✓ Images rebuilt${NC}"
}

dev_clean() {
    echo -e "${RED}WARNING: This will remove all development containers, volumes, and images!${NC}"
    read -p "Continue? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Cleaning up development environment...${NC}"
        docker-compose --env-file .env.docker down -v
        docker system prune -f
        echo -e "${GREEN}✓ Development environment cleaned${NC}"
    fi
}

# Production environment commands
prod_start() {
    echo -e "${GREEN}Starting production environment...${NC}"
    docker-compose -f docker-compose.prod.yml --env-file .env.docker.prod up -d
    echo -e "${GREEN}✓ Production environment started${NC}"
    echo ""
    echo "App running on: http://localhost:3000"
}

prod_logs() {
    echo -e "${YELLOW}Showing production logs (Ctrl+C to exit)...${NC}"
    docker-compose -f docker-compose.prod.yml --env-file .env.docker.prod logs -f
}

prod_down() {
    echo -e "${YELLOW}Stopping production environment...${NC}"
    docker-compose -f docker-compose.prod.yml --env-file .env.docker.prod down
    echo -e "${GREEN}✓ Production environment stopped${NC}"
}

prod_rebuild() {
    echo -e "${YELLOW}Rebuilding production images...${NC}"
    docker-compose -f docker-compose.prod.yml --env-file .env.docker.prod build --no-cache
    echo -e "${GREEN}✓ Images rebuilt${NC}"
}

# Database commands
db_shell() {
    echo -e "${YELLOW}Opening PostgreSQL shell...${NC}"
    docker-compose --env-file .env.docker exec postgres psql -U postgres -d debt_tracker
}

db_backup() {
    echo -e "${YELLOW}Creating database backup...${NC}"
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="backups/debt_tracker_backup_$TIMESTAMP.sql"
    mkdir -p backups
    docker-compose --env-file .env.docker exec postgres pg_dump -U postgres -d debt_tracker > "$BACKUP_FILE"
    echo -e "${GREEN}✓ Backup created: $BACKUP_FILE${NC}"
}

db_restore() {
    if [ -z "$1" ]; then
        echo -e "${RED}Error: No backup file specified${NC}"
        echo "Usage: ./docker-commands.sh db-restore <backup_file>"
        exit 1
    fi
    
    if [ ! -f "$1" ]; then
        echo -e "${RED}Error: File not found: $1${NC}"
        exit 1
    fi
    
    echo -e "${RED}WARNING: This will overwrite the database!${NC}"
    read -p "Continue? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Restoring database from $1...${NC}"
        cat "$1" | docker-compose --env-file .env.docker exec -T postgres psql -U postgres -d debt_tracker
        echo -e "${GREEN}✓ Database restored${NC}"
    fi
}

db_migrate() {
    echo -e "${YELLOW}Running TypeORM migrations...${NC}"
    docker-compose --env-file .env.docker exec app npm run db:migrate
    echo -e "${GREEN}✓ Migrations completed${NC}"
}

db_seed() {
    echo -e "${YELLOW}Seeding database with sample data...${NC}"
    docker-compose --env-file .env.docker exec app npm run db:seed
    echo -e "${GREEN}✓ Database seeded${NC}"
}

# Utility commands
show_ps() {
    echo -e "${YELLOW}Running containers:${NC}"
    docker-compose --env-file .env.docker ps
}

show_status() {
    echo -e "${YELLOW}System Status:${NC}"
    echo ""
    echo "Docker version:"
    docker --version
    echo ""
    echo "Docker Compose version:"
    docker-compose --version
    echo ""
    echo "Running containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

# Main command dispatcher
case "$1" in
    # Development
    dev)           dev_start ;;
    dev-logs)      dev_logs ;;
    dev-down)      dev_down ;;
    dev-rebuild)   dev_rebuild ;;
    dev-clean)     dev_clean ;;
    
    # Production
    prod)          prod_start ;;
    prod-logs)     prod_logs ;;
    prod-down)     prod_down ;;
    prod-rebuild)  prod_rebuild ;;
    
    # Database
    db-shell)      db_shell ;;
    db-backup)     db_backup ;;
    db-restore)    db_restore "$2" ;;
    db-migrate)    db_migrate ;;
    db-seed)       db_seed ;;
    
    # Utility
    ps)            show_ps ;;
    status)        show_status ;;
    help)          print_help ;;
    *)             
        echo -e "${RED}Unknown command: $1${NC}"
        echo ""
        print_help
        exit 1
        ;;
esac
