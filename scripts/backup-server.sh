#!/usr/bin/env bash
# =============================================================================
# FxLedger — Server-seitiges Backup Script
# Direkt auf dem Hetzner-Server ausführen (kein SSH nötig).
#
# Aufruf (auf dem Server):
#   cd /var/www/fxledger
#   bash scripts/backup-server.sh
#
# Die Backup-Dateien werden in ./backups/ gespeichert.
# Danach lokal herunterladen mit:
#   scp user550398@<IP>:/var/www/fxledger/backups/db_*.sql ./backups/
#   scp user550398@<IP>:/var/www/fxledger/backups/uploads_*.tar.gz ./backups/
# =============================================================================

set -euo pipefail

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_FILE="$BACKUP_DIR/db_${TIMESTAMP}.sql"
UPLOADS_FILE="$BACKUP_DIR/uploads_${TIMESTAMP}.tar.gz"

# Docker-Präfix: sudo falls nötig
DOCKER="sudo docker"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   FxLedger Backup  —  $TIMESTAMP   ║"
echo "╚══════════════════════════════════════╝"
echo ""

mkdir -p "$BACKUP_DIR"

# Container-Namen ermitteln
DB_CONTAINER=$(sudo docker compose ps -q db 2>/dev/null || \
               sudo docker ps --filter "name=db" --format "{{.Names}}" | head -1)
BACKEND_CONTAINER=$(sudo docker compose ps -q backend 2>/dev/null || \
                    sudo docker ps --filter "name=backend" --format "{{.Names}}" | head -1)

if [[ -z "$DB_CONTAINER" ]]; then
  echo "FEHLER: DB-Container nicht gefunden. Läuft docker compose?"
  exit 1
fi

echo "  DB-Container:      $DB_CONTAINER"
echo "  Backend-Container: $BACKEND_CONTAINER"
echo ""

# 1) Datenbank-Backup ----------------------------------------------------------
echo "▶ PostgreSQL pg_dump …"
$DOCKER exec "$DB_CONTAINER" pg_dump -U mltrader mltraderlog > "$DB_FILE"
DB_SIZE=$(du -sh "$DB_FILE" | cut -f1)
echo "  ✓ DB gespeichert: $DB_FILE ($DB_SIZE)"

# 2) Uploads-Volume ------------------------------------------------------------
echo "▶ Uploads-Volume sichern …"
if [[ -n "$BACKEND_CONTAINER" ]]; then
  $DOCKER run --rm \
    --volumes-from "$BACKEND_CONTAINER" \
    alpine \
    tar czf - /app/uploads > "$UPLOADS_FILE"
  UP_SIZE=$(du -sh "$UPLOADS_FILE" | cut -f1)
  echo "  ✓ Uploads gespeichert: $UPLOADS_FILE ($UP_SIZE)"
else
  echo "  ⚠ Backend-Container nicht gefunden — Uploads übersprungen."
fi

# 3) Zusammenfassung -----------------------------------------------------------
echo ""
echo "Backup abgeschlossen:"
echo "  DB      → $DB_FILE"
echo "  Uploads → $UPLOADS_FILE"
echo ""
echo "Zum Herunterladen auf deinen lokalen Rechner (Git Bash):"
echo "  scp user550398@$(hostname -I | awk '{print $1}'):/var/www/fxledger/$DB_FILE ./backups/"
echo "  scp user550398@$(hostname -I | awk '{print $1}'):/var/www/fxledger/$UPLOADS_FILE ./backups/"
echo ""
