#!/usr/bin/env bash
# =============================================================================
# FxLedger — Backup Script
# Sichert PostgreSQL-DB und Uploads-Volume vom Hetzner-Server auf den lokalen
# Rechner. Läuft in Git Bash (Windows) oder jedem Unix-Terminal.
#
# Konfiguration: Passe die drei Variablen am Anfang an.
# Aufruf:        bash scripts/backup.sh
# =============================================================================

set -euo pipefail

# --- Konfiguration -----------------------------------------------------------
SSH_TARGET="root@<HETZNER_IP>"          # z.B. "root@65.21.xx.xx"
SSH_KEY=""                               # optional: "-i ~/.ssh/id_rsa"
COMPOSE_PROJECT="mltraderlog"            # docker compose Projektname
# -----------------------------------------------------------------------------

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_FILE="$BACKUP_DIR/db_${TIMESTAMP}.sql"
UPLOADS_FILE="$BACKUP_DIR/uploads_${TIMESTAMP}.tar.gz"

# SSH-Kommando zusammenbauen
SSH="ssh"
if [[ -n "$SSH_KEY" ]]; then
  SSH="ssh $SSH_KEY"
fi

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   FxLedger Backup  —  $TIMESTAMP   ║"
echo "╚══════════════════════════════════════╝"
echo ""

mkdir -p "$BACKUP_DIR"

# 1) Datenbank-Backup ----------------------------------------------------------
echo "▶ PostgreSQL pg_dump …"
$SSH "$SSH_TARGET" \
  "docker exec ${COMPOSE_PROJECT}-db-1 pg_dump -U mltrader mltraderlog" \
  > "$DB_FILE"

DB_SIZE=$(du -sh "$DB_FILE" | cut -f1)
echo "  ✓ DB gespeichert: $DB_FILE ($DB_SIZE)"

# 2) Uploads-Volume ------------------------------------------------------------
echo "▶ Uploads-Volume sichern …"
$SSH "$SSH_TARGET" \
  "docker run --rm \
     --volumes-from ${COMPOSE_PROJECT}-backend-1 \
     alpine \
     tar czf - /app/uploads" \
  > "$UPLOADS_FILE"

UP_SIZE=$(du -sh "$UPLOADS_FILE" | cut -f1)
echo "  ✓ Uploads gespeichert: $UPLOADS_FILE ($UP_SIZE)"

# 3) Zusammenfassung -----------------------------------------------------------
echo ""
echo "Backup abgeschlossen:"
echo "  DB      → $DB_FILE"
echo "  Uploads → $UPLOADS_FILE"
echo ""
echo "Ältere Backups (>30 Tage) werden nicht automatisch gelöscht."
echo "Tipp: 'ls -lh $BACKUP_DIR' für Übersicht."
echo ""
