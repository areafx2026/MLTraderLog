#!/usr/bin/env bash
# =============================================================================
# FxLedger — Restore Script
# Stellt DB und/oder Uploads aus einem lokalen Backup auf dem Hetzner-Server
# wieder her.
#
# Aufruf:
#   bash scripts/restore.sh --db backups/db_20250527_120000.sql
#   bash scripts/restore.sh --uploads backups/uploads_20250527_120000.tar.gz
#   bash scripts/restore.sh --db backups/db_*.sql --uploads backups/uploads_*.tar.gz
#
# WARNUNG: --db überschreibt die gesamte Datenbank!
# =============================================================================

set -euo pipefail

# --- Konfiguration (identisch zu backup.sh) ----------------------------------
SSH_TARGET="root@<HETZNER_IP>"
SSH_KEY=""
COMPOSE_PROJECT="mltraderlog"
# -----------------------------------------------------------------------------

SSH="ssh"
if [[ -n "$SSH_KEY" ]]; then
  SSH="ssh $SSH_KEY"
fi

DB_FILE=""
UPLOADS_FILE=""

# Argumente parsen
while [[ $# -gt 0 ]]; do
  case "$1" in
    --db)       DB_FILE="$2";      shift 2 ;;
    --uploads)  UPLOADS_FILE="$2"; shift 2 ;;
    *) echo "Unbekannte Option: $1"; exit 1 ;;
  esac
done

if [[ -z "$DB_FILE" && -z "$UPLOADS_FILE" ]]; then
  echo "Verwendung: bash scripts/restore.sh [--db <file.sql>] [--uploads <file.tar.gz>]"
  exit 1
fi

echo ""
echo "╔══════════════════════════════════════╗"
echo "║         FxLedger Restore             ║"
echo "╚══════════════════════════════════════╝"
echo ""

# 1) Datenbank wiederherstellen -----------------------------------------------
if [[ -n "$DB_FILE" ]]; then
  if [[ ! -f "$DB_FILE" ]]; then
    echo "FEHLER: Datei nicht gefunden: $DB_FILE"
    exit 1
  fi
  echo "⚠  DB-Restore überschreibt die komplette Datenbank auf dem Server!"
  read -rp "   Fortfahren? (ja/nein): " CONFIRM
  if [[ "$CONFIRM" != "ja" ]]; then
    echo "Abgebrochen."
    exit 0
  fi

  echo "▶ DB hochladen und wiederherstellen …"
  # Bestehende DB droppen und neu anlegen, dann SQL einspielen
  $SSH "$SSH_TARGET" \
    "docker exec ${COMPOSE_PROJECT}-db-1 psql -U mltrader -c 'DROP DATABASE IF EXISTS mltraderlog;' postgres && \
     docker exec ${COMPOSE_PROJECT}-db-1 psql -U mltrader -c 'CREATE DATABASE mltraderlog;' postgres"

  cat "$DB_FILE" | $SSH "$SSH_TARGET" \
    "docker exec -i ${COMPOSE_PROJECT}-db-1 psql -U mltrader mltraderlog"

  echo "  ✓ DB wiederhergestellt aus $DB_FILE"
fi

# 2) Uploads wiederherstellen --------------------------------------------------
if [[ -n "$UPLOADS_FILE" ]]; then
  if [[ ! -f "$UPLOADS_FILE" ]]; then
    echo "FEHLER: Datei nicht gefunden: $UPLOADS_FILE"
    exit 1
  fi

  echo "▶ Uploads hochladen und wiederherstellen …"
  cat "$UPLOADS_FILE" | $SSH "$SSH_TARGET" \
    "docker run --rm -i \
       --volumes-from ${COMPOSE_PROJECT}-backend-1 \
       alpine \
       tar xzf - -C /"

  echo "  ✓ Uploads wiederhergestellt aus $UPLOADS_FILE"
fi

echo ""
echo "Restore abgeschlossen. Backend ggf. neu starten:"
echo "  docker compose restart backend"
echo ""
