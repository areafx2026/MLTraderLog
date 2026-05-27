# FxLedger — Scripts

## Backup (auf dem Server ausführen)

Auf dem Hetzner-Server einloggen und ausführen:

```bash
ssh user550398@<HETZNER_IP>
cd /var/www/fxledger
bash scripts/backup-server.sh
```

Erzeugt in `./backups/`:
- `db_YYYYMMDD_HHMMSS.sql` — vollständiger PostgreSQL-Dump
- `uploads_YYYYMMDD_HHMMSS.tar.gz` — alle User-Screenshots

Das Script gibt am Ende die fertigen `scp`-Befehle aus, um die Dateien
auf deinen lokalen Rechner zu laden.

## Restore (auf dem Server ausführen)

```bash
ssh user550398@<HETZNER_IP>
cd /var/www/fxledger

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
