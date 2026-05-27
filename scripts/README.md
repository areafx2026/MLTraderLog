# FxLedger — Scripts

## Vorbereitung

In `backup.sh` und `restore.sh` die Konfiguration anpassen:

```bash
SSH_TARGET="root@<HETZNER_IP>"   # deine Server-IP
SSH_KEY="-i ~/.ssh/id_rsa"        # falls nicht im ssh-agent
COMPOSE_PROJECT="mltraderlog"     # docker compose Projektname (normalerweise OK)
```

## Backup

```bash
bash scripts/backup.sh
```

Erzeugt in `./backups/`:
- `db_YYYYMMDD_HHMMSS.sql` — vollständiger PostgreSQL-Dump
- `uploads_YYYYMMDD_HHMMSS.tar.gz` — alle User-Screenshots

## Restore

```bash
# Nur DB
bash scripts/restore.sh --db backups/db_20250527_120000.sql

# Nur Uploads
bash scripts/restore.sh --uploads backups/uploads_20250527_120000.tar.gz

# Beides
bash scripts/restore.sh \
  --db backups/db_20250527_120000.sql \
  --uploads backups/uploads_20250527_120000.tar.gz
```

> **Achtung**: DB-Restore löscht und ersetzt die gesamte Datenbank.
> Das Script fragt vor dem Ausführen nach Bestätigung.

## Backups-Ordner

`./backups/` ist in `.gitignore` — SQL-Dumps und Archiv-Dateien landen nie im Repo.
