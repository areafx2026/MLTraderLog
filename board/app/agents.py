import base64
import os
import anthropic
from pathlib import Path

DATA_DIR = Path("/data")
UPLOAD_DIR = DATA_DIR / "uploads" / "pending"
USED_DIR   = DATA_DIR / "uploads" / "used"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
USED_DIR.mkdir(parents=True, exist_ok=True)

IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg", ".gif", ".webp"}
TEXT_SUFFIXES  = {".txt", ".md", ".pdf"}
ALLOWED_SUFFIXES = IMAGE_SUFFIXES | TEXT_SUFFIXES

MIME_MAP = {
    ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
    ".gif": "image/gif", ".webp": "image/webp",
}

ROLES = ["cfo", "cio", "cmo"]  # CEO = User; Reihenfolge der Agenten pro Runde

ROLE_LABELS = {
    "cfo": "CFO",
    "cio": "CIO",
    "cmo": "CMO",
}

SYSTEM_PROMPTS = {
    "cfo": (
        "Du bist CFO von FxLedger. Antworte stets aus deiner Finanzperspektive: "
        "Kosten, ROI, wirtschaftliche Nachhaltigkeit. Sei präzise und direkt. "
        "Kein Smalltalk. Sprich die anderen CxOs bei Bedarf direkt an."
    ),
    "cio": (
        "Du bist CIO von FxLedger. Antworte stets aus deiner technischen Perspektive: "
        "Architektur, Machbarkeit, Risiken, technische Schulden. Sei präzise und direkt. "
        "Kein Smalltalk. Sprich die anderen CxOs bei Bedarf direkt an."
    ),
    "cmo": (
        "Du bist CMO von FxLedger. Antworte stets aus deiner Marketing-Perspektive: "
        "Positionierung, Zielgruppe, Wachstum, Differenzierung. Sei präzise und direkt. "
        "Kein Smalltalk. Sprich die anderen CxOs bei Bedarf direkt an."
    ),
}


def _read_file(path: Path) -> str:
    if path.exists():
        return path.read_text(encoding="utf-8")
    return ""


def extract_text(path: Path) -> str:
    """Extrahiert Text aus .txt, .md oder .pdf."""
    if path.suffix.lower() == ".pdf":
        try:
            from pypdf import PdfReader
            reader = PdfReader(str(path))
            return "\n\n".join(page.extract_text() or "" for page in reader.pages).strip()
        except Exception as e:
            return f"[PDF konnte nicht gelesen werden: {e}]"
    return _read_file(path)


def list_uploads() -> list[dict]:
    """Gibt pending + used Dateien zurück."""
    files = []
    for f in sorted(UPLOAD_DIR.iterdir()):
        if f.is_file():
            files.append({"name": f.name, "size": f.stat().st_size, "status": "pending"})
    for f in sorted(USED_DIR.iterdir()):
        if f.is_file():
            files.append({"name": f.name, "size": f.stat().st_size, "status": "used"})
    return files


def _mark_used(path: Path):
    """Verschiebt eine Datei von pending nach used."""
    dest = USED_DIR / path.name
    # Falls Dateiname bereits in used existiert, überschreiben
    path.rename(dest)


def build_message_content(company_ctx: str, role_ctx: str, history_text: str, user_input: str, role: str) -> list:
    """
    Baut den message-content für die Claude API.
    Pending-Dateien werden einmalig eingebunden und danach als 'used' markiert.
    Bilder kommen als vision-Blöcke, Texte/PDFs als Text.
    """
    pending = sorted(UPLOAD_DIR.iterdir()) if UPLOAD_DIR.exists() else []
    pending = [f for f in pending if f.is_file()]

    text_intro = (
        f"{company_ctx}\n\n{role_ctx}\n\n"
        f"## Bisheriger Gesprächsverlauf dieser Runde\n\n{history_text}\n\n"
        f"## Neuer Impuls vom CEO\n\n{user_input}\n\n"
    )

    content: list = []

    # Text-Block mit Intro
    text_parts = [text_intro]

    for f in pending:
        suffix = f.suffix.lower()
        if suffix in TEXT_SUFFIXES:
            extracted = extract_text(f)
            if extracted:
                text_parts.append(f"## Hochgeladenes Dokument: {f.name}\n\n{extracted}\n\n")
        elif suffix in IMAGE_SUFFIXES:
            # Erst alle bisherigen Text-Teile zusammenfassen
            content.append({"type": "text", "text": "".join(text_parts)})
            text_parts = []
            # Bild als vision-Block
            mime = MIME_MAP.get(suffix, "image/png")
            data = base64.standard_b64encode(f.read_bytes()).decode()
            content.append({
                "type": "image",
                "source": {"type": "base64", "media_type": mime, "data": data},
            })
            content.append({"type": "text", "text": f"(Oben: Screenshot '{f.name}')\n\n"})

    # Abschließender Text-Block mit Aufforderung
    text_parts.append(f"Antworte jetzt als {ROLE_LABELS[role]}. Maximal 150 Wörter.")
    content.append({"type": "text", "text": "".join(text_parts)})

    # Alle pending als used markieren
    for f in pending:
        try:
            _mark_used(f)
        except Exception:
            pass

    return content


def build_context() -> str:
    company = _read_file(DATA_DIR / "company.md")
    return f"# Unternehmenskontext\n\n{company}"


def build_role_context(role: str) -> str:
    role_md = _read_file(DATA_DIR / f"cxo_{role}.md")
    return f"# Deine Rollendatei\n\n{role_md}"


def build_history_text(history: list[dict]) -> str:
    if not history:
        return ""
    lines = []
    for msg in history:
        speaker = msg.get("speaker", "?")
        text = msg.get("text", "")
        lines.append(f"**{speaker}:** {text}")
    return "\n\n".join(lines)


async def stream_agent_response(role: str, history: list[dict], user_input: str):
    """Generator: liefert Text-Chunks des Agenten als SSE-Daten."""
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

    company_ctx = build_context()
    role_ctx = build_role_context(role)
    history_text = build_history_text(history)

    content = build_message_content(company_ctx, role_ctx, history_text, user_input, role)

    with client.messages.stream(
        model="claude-sonnet-4-6",
        max_tokens=400,
        system=SYSTEM_PROMPTS[role],
        messages=[{"role": "user", "content": content}],
    ) as stream:
        for text in stream.text_stream:
            yield text


async def write_round_summary(history: list[dict], round_num: int):
    """Lässt jeden Agenten seine MD-Datei aktualisieren und schreibt Shared-Entscheidungen in company.md."""
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    company_ctx = build_context()
    history_text = build_history_text(history)

    for role in ROLES:
        role_ctx = build_role_context(role)
        prompt = (
            f"{company_ctx}\n\n{role_ctx}\n\n"
            f"## Gesprächsverlauf der abgeschlossenen Runde\n\n{history_text}\n\n"
            f"Aktualisiere deine Rollendatei (cxo_{role}.md). "
            f"Schreibe nur den vollständigen, aktualisierten Inhalt der Datei — kein Kommentar drumherum. "
            f"Übernimm alle bestehenden Abschnitte, aktualisiere 'Aktuelle Prioritäten' und ergänze relevante Notizen."
        )
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1000,
            system=SYSTEM_PROMPTS[role],
            messages=[{"role": "user", "content": prompt}],
        )
        new_content = response.content[0].text.strip()
        (DATA_DIR / f"cxo_{role}.md").write_text(new_content, encoding="utf-8")

    from datetime import date
    today = date.today().isoformat()
    shared_prompt = (
        f"{company_ctx}\n\n"
        f"## Gesprächsverlauf der abgeschlossenen Runde\n\n{history_text}\n\n"
        f"Extrahiere Entscheidungen und Erkenntnisse, die mindestens 2 CxOs betreffen oder strategisch relevant sind. "
        f"Schreibe einen neuen Tagebucheintrag im Format:\n\n"
        f"### {today} — Runde {round_num}\n\n- Punkt 1\n- Punkt 2\n\n"
        f"Gib nur den Tagebucheintrag aus, nichts weiter."
    )
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=500,
        messages=[{"role": "user", "content": shared_prompt}],
    )
    entry = response.content[0].text.strip()

    company_md = _read_file(DATA_DIR / "company.md")
    updated = company_md.replace(
        "<!-- Einträge werden nach jeder Diskussionsrunde hier ergänzt -->",
        f"<!-- Einträge werden nach jeder Diskussionsrunde hier ergänzt -->\n\n{entry}",
    )
    if entry not in updated:
        updated = company_md + f"\n\n{entry}"
    (DATA_DIR / "company.md").write_text(updated, encoding="utf-8")
