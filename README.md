# MLTraderLog

Trading Journal für S/R-Zone Strategie mit ML-Datenerfassung.

## Stack
- **Frontend:** React + Vite → Nginx (Port 8082)
- **Backend:** Express / Node.js (Port 3002)
- **DB:** PostgreSQL 16 (intern)

## Setup auf thanos

```bash
# 1. Repo klonen
mkdir -p ~/docker/MLTraderLog
cd ~/docker/MLTraderLog
git clone https://github.com/areafx2026/MLTraderLog.git .

# 2. Environment
cp .env.example .env
nano .env   # DB_PASSWORD setzen

# 3. Starten
docker compose up -d --build

# 4. Logs prüfen
docker compose logs -f
```

## GitHub Actions Secrets

| Secret | Wert |
|---|---|
| `THANOS_HOST` | IP/Hostname von thanos |
| `THANOS_USER` | SSH-Username |
| `THANOS_SSH_KEY` | Privater SSH-Key |

## Ports

| Service | Port |
|---|---|
| Frontend | 8082 |
| Backend API | 3002 |
| DB | intern |

## Trade-Felder

- **Basis:** Pair, Datum, Richtung (LONG/SHORT)
- **Kontext:** Daily-Struktur, Zone-Tests, letzter Test
- **Anlauf:** Impulsiv / Meandernd / Langsam
- **H1-Verhalten:** Abbremsen, Wicks, Stabilisierung, Rejection
- **Entry:** Trigger-Text, Entry/SL/TP → R:R errechnet automatisch
- **Ergebnis:** Status (OPEN/WIN/LOSS/BE), P&L EUR, Dauer Tage
- **Screenshots:** max. 2 Bilder
- **Notizen:** Freitext
