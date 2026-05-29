# FxLedger Board

KI-gestütztes CxO-Gremium für FxLedger. Läuft unter `board.areafx.de`.

## Einmaliges Server-Setup

### 1. Passwort setzen (Basic Auth)
```bash
sudo apt install apache2-utils   # falls htpasswd fehlt
sudo htpasswd -c /etc/nginx/.htpasswd board
# Passwort eingeben — wird verschlüsselt gespeichert
```

### 2. Nginx-Config einrichten
```bash
sudo cp /opt/mltraderlog/board/nginx/board.conf /etc/nginx/sites-available/board
sudo ln -s /etc/nginx/sites-available/board /etc/nginx/sites-enabled/board
sudo nginx -t && sudo systemctl reload nginx
```

### 3. SSL-Zertifikat holen
```bash
sudo certbot --nginx -d board.areafx.de
```

### 4. .env anlegen
```bash
cp /opt/mltraderlog/board/.env.example /opt/mltraderlog/board/.env
nano /opt/mltraderlog/board/.env
# ANTHROPIC_API_KEY eintragen
```

### 5. Container starten
```bash
cd /opt/mltraderlog/board
docker compose up --build -d
```

---

## Deployment nach Code-Änderungen

```bash
cd /opt/mltraderlog
git pull
cd board
docker compose up --build -d
```

---

## Struktur

```
board/
├── app/
│   ├── main.py          # FastAPI, Endpunkte, SSE
│   ├── agents.py        # Claude API Aufrufe, MD-Schreiben
│   ├── requirements.txt
│   └── static/
│       └── index.html   # UI
├── data/                # MD-Dateien (versioniert)
│   ├── company.md
│   ├── cxo_ceo.md
│   ├── cxo_cfo.md
│   ├── cxo_cio.md
│   └── cxo_cmo.md
├── nginx/
│   └── board.conf       # Nginx-Config für board.areafx.de
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## Nutzung

1. `board.areafx.de` im Browser öffnen → Passwort eingeben
2. Impuls ins Textfeld schreiben → **Runde starten**
3. CFO, CIO, CMO antworten nacheinander (live gestreamt)
4. Neuen Impuls eingeben → **Weiter** für die nächste Iteration
5. **Runde beenden & speichern** → MD-Dateien werden automatisch aktualisiert

**Strg+Enter** = Runde starten / Weiter (je nach Status)
