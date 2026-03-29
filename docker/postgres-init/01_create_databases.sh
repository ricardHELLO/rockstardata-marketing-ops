#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE USER paperclip WITH PASSWORD '${PAPERCLIP_DB_PASSWORD:-paperclip_dev}';
  CREATE DATABASE paperclip_db OWNER paperclip;
  GRANT ALL PRIVILEGES ON DATABASE paperclip_db TO paperclip;
EOSQL
