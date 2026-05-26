# FxLedger — Architekturübersicht

---

## Systemtopologie

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser                                                        │
│  React SPA (Vite build, static via nginx)                       │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/REST  /api/*
                         │ (nginx reverse proxy im selben Container-Netz)
┌────────────────────────▼────────────────────────────────────────┐
│  Backend  Node.js / Express  :3002                              │
│  JWT-Auth · bcrypt · multer · nodemailer                        │
└──────────┬──────────────────────────────────┬───────────────────┘
           │ SQL (pg)                          │ SMTP
┌──────────▼───────────┐           ┌──────────▼───────────┐
│  PostgreSQL :5432     │           │  Resend.com           │
│  (Docker Volume)      │           │  (Transactional Mail) │
└───────────────────────┘           └──────────────────────┘

Hosting: Hetzner VPS · Docker Compose
Repo:    GitHub areafx2026/MLTraderLog
```

---

## Docker Compose — Services

```
docker-compose.yml
├── db          postgres:16-alpine
│               Volume: mltraderlog_db_data
│               Netz:   forexlog_net
│
├── backend     ./backend  (node:22-alpine)
│               Port:   3002 (intern)
│               Env:    DB_*, JWT_SECRET, SMTP_*
│               Volume: mltraderlog_uploads  →  /app/uploads
│               Netz:   forexlog_net
│
└── frontend    ./frontend  (nginx)
                Port:   8082:80  (öffentlich)
                Netz:   forexlog_net
                → /api/* → backend:3002  (proxy)
                → /*     → dist/index.html
```

---

## Datenbank — Schema

```
users
├── id              UUID  PK
├── email           VARCHAR  UNIQUE
├── username        VARCHAR(20)  UNIQUE (case-insensitive index)
├── password_hash   VARCHAR
├── design          VARCHAR(10)   DEFAULT 'hyper'   ← linen | hyper
├── color_mode      VARCHAR(10)   DEFAULT 'dark'    ← light | dark | system
├── email_verified  BOOLEAN       DEFAULT TRUE
├── design_migrated BOOLEAN       DEFAULT FALSE     ← einmalige Migration
└── created_at      TIMESTAMPTZ

trades
├── id              SERIAL  PK
├── user_id         UUID  FK → users (CASCADE)
├── pair, direction, trade_date, trade_time
├── entry_price, exit_price, sl_price, tp_price, lot_size
├── pips, rr_multiple
├── result_eur, result_status   ← WIN | LOSS | BE | OPEN
├── tag, mood, notes
├── screenshot_1, screenshot_2  ← Pfad unter /app/uploads/{user_id}/
└── created_at

email_verifications
├── id          SERIAL  PK
├── user_id     UUID  FK → users (CASCADE)
├── code        CHAR(6)
├── expires_at  TIMESTAMPTZ   ← 15 min TTL
└── created_at

password_history
├── id           SERIAL  PK
├── user_id      UUID  FK → users (CASCADE)
├── password_hash VARCHAR
└── created_at   ← letzte 3 gesperrt, max 10 gespeichert
```

---

## Backend — API-Endpunkte

```
Auth (kein Token nötig)
  POST  /api/auth/register            → Code senden, requiresVerification
  POST  /api/auth/login               → JWT | 403 wenn unverifiziert
  POST  /api/auth/verify-email        → Code prüfen → JWT
  POST  /api/auth/resend-verification → Rate-limit 60s
  POST  /api/auth/check-username      → Verfügbarkeit prüfen

Auth (Bearer JWT)
  GET   /api/auth/me                  → User-Profil
  PUT   /api/auth/appearance          → design + mode speichern
  PUT   /api/auth/email               → E-Mail ändern (PW-Prüfung)
  PUT   /api/auth/password            → PW ändern (History-Check)
  DELETE /api/auth/account            → Account + alle Daten löschen

Trades (Bearer JWT)
  GET   /api/trades                   → alle Trades des Users
  GET   /api/trades/:id               → einzelner Trade
  POST  /api/trades                   → Trade anlegen
  PUT   /api/trades/:id               → Trade bearbeiten
  DELETE /api/trades/:id              → Trade löschen

Sonstiges (Bearer JWT)
  POST  /api/upload                   → Screenshot hochladen (max 2×10 MB)
  GET   /api/stats                    → aggregierte Statistiken
  GET   /api/equity                   → kumulative Equity-Kurve
  GET   /api/export                   → CSV-Download aller Trades
```

---

## Frontend — Komponentenbaum

```
App.jsx  (Root-State, kein Router — screen-basierte Navigation)
│
├── State
│   ├── design / mode / resolvedMode  → t (Theme-Objekt)
│   ├── token / user                  → localStorage (Token, User-Cache)
│   ├── trades                        → in-memory
│   └── nav { screen, tradeId }       → localStorage
│
├── AuthScreen          Login | Register | Verify (OTP)
│   └── OtpInput        6 Einzelboxen, Auto-Advance, Paste
│
└── Layout (nach Login)
    ├── Sidebar
    │   ├── Navigation (Today | Trades | Insights | Settings)
    │   ├── Avatar → Profile
    │   └── Datum + Wochenstatistik
    │
    └── Screens (flex: 1)
        ├── Dashboard       Equity-Chart + Stats + Recent Trades
        │   └── EquityChart (SVG, client-side)
        ├── TradeList       Liste + Card-View
        ├── TradeDetail     Einzelansicht + Edit/Delete
        ├── TradeForm       Anlegen / Bearbeiten
        ├── Insights        Tiefere Auswertungen
        ├── Settings        Design · Mode · View · Export · Delete
        ├── Profile         Username · E-Mail · Passwort · Sign out
        └── DeleteAccount   Typ-Bestätigung + Modal
```

---

## Theme-System — 2D Design × Mode

```
design  ──→  'linen'  |  'hyper'
mode    ──→  'light'  |  'dark'  |  'system'
                                       ↓
                              resolvedMode = OS-Präferenz

themeKey = `${design}-${resolvedMode}`
                ↓
        THEMES[themeKey]  →  t.*

┌────────────┬───────────────────┬──────────────────────┐
│            │ light             │ dark                 │
├────────────┼───────────────────┼──────────────────────┤
│ linen      │ Creme #fbf6ec     │ Grün-Schwarz #171816 │
│            │ Newsreader Serif  │ Newsreader Serif      │
├────────────┼───────────────────┼──────────────────────┤
│ hyper      │ Violet-Weiß       │ Navy #0b0b14         │
│            │ Glass + Shadow    │ Glass + Bloom        │
│            │ Inter überall     │ Inter überall        │
└────────────┴───────────────────┴──────────────────────┘

t.*  wird als Prop durch den gesamten Baum gereicht.
Kein Context, kein CSS-in-JS — reines Prop-Drilling.

Assets: 4 Logos (lockup-*.svg), 4 Favicons (favicon-*.svg)
        → getThemeAssets(design, resolvedMode)
        → Favicon per useEffect live getauscht
```

---

## Auth-Flow

```
Register
  Formular → POST /register (email, pw, username, design, mode)
           → DB: user (email_verified=FALSE, design/mode gespeichert)
           → Code generieren → email_verifications → Mail via Resend
           ← { requiresVerification, email }
           → OTP-Screen (6-stellig, 15 min TTL, Resend nach 60s)
           → POST /verify-email
           ← { token, user }  → eingeloggt

Login
  Formular → POST /login
           → PW-Hash-Check
           → email_verified? Nein → frischer Code → OTP-Screen
           ← { token, user }  → eingeloggt

Session
  JWT (30 Tage) im localStorage.
  Startup: GET /auth/me → design/mode in State laden.
  Theme nie im localStorage — immer nur DB → Memory.

Passwort
  Ändern:   PUT /auth/password (aktuelles PW + History-Check letzte 3)
  History:  password_history-Tabelle, max 10 Einträge pro User

Account löschen
  DELETE /auth/account → User-Row → CASCADE → Trades + History + Codes
  → handleSignOut() → State reset → hyper/dark
```

---

## Datenflussprinzipien

```
Trades      → nur server-side berechnet (pips, R:R, Status)
Stats       → client-side (chartUtils.js: computeStats, computeEquity)
Equity      → client-side aus Trades-Array aufgebaut
Screenshots → multipart/form-data → /app/uploads/{userId}/{filename}
              Pfad in trades.screenshot_1/2 gespeichert
              Served als static via /uploads/*
Theme       → DB ist die einzige Quelle der Wahrheit
              kein localStorage-Cache für design/mode
```
