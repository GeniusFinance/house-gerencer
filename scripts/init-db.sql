#!/bin/bash

# Database initialization script for PostgreSQL
# This script creates initial tables and test data

set -e

echo "Creating database extensions..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create UUID extension if not exists
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    -- Create other useful extensions
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";
EOSQL

echo "Database initialization complete!"
