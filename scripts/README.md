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

---

## Lasttest

### Vorbereitung

In der `.env` auf dem Server `TEST_MODE=true` setzen:
```bash
echo "TEST_MODE=true" >> /var/www/fxledger/.env
sudo docker compose restart backend
```

> **Achtung**: Danach wieder auf `false` setzen! TEST_MODE deaktiviert E-Mail-Verifizierung.

### Fake-User und Trades generieren (Node.js)

```bash
# 20 User, je 50 Trades
node scripts/seed.js --url https://fxledger.yourdomain.com --users 20 --trades 50

# Testdaten danach löschen
node scripts/seed.js --url https://fxledger.yourdomain.com --cleanup
```

### Lasttest mit k6 (100 simultane User)

k6 installieren: https://k6.io/docs/get-started/installation/

```bash
# Standard: 100 VUs, 60 Sekunden
k6 run --env BASE_URL=https://fxledger.yourdomain.com scripts/loadtest.js

# Schneller Test mit weniger VUs
k6 run --vus 10 --duration 30s --env BASE_URL=https://... scripts/loadtest.js
```

k6 gibt am Ende einen Report mit Latenz-Percentilen (p95, p99), Fehlerrate und Durchsatz.

### Aufräumen nach dem Test

```bash
# Alle @loadtest.fake User löschen (via API)
node scripts/seed.js --url https://... --cleanup

# TEST_MODE wieder deaktivieren
# In .env: TEST_MODE=false
sudo docker compose restart backend
```
