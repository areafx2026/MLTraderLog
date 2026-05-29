import json
import os
import asyncio
from pathlib import Path
from typing import AsyncGenerator

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from sse_starlette.sse import EventSourceResponse

load_dotenv()

from agents import ROLES, ROLE_LABELS, stream_agent_response, write_round_summary

app = FastAPI()

# --- Globaler Runden-State (single-user, kein DB nötig) ---
state = {
    "active": False,
    "round_num": 0,
    "history": [],       # [{"speaker": "CEO", "text": "..."}, ...]
    "pending_role_idx": 0,  # welcher Agent ist als nächstes dran
    "streaming": False,
}


@app.get("/", response_class=HTMLResponse)
async def index():
    html_path = Path(__file__).parent / "static" / "index.html"
    return HTMLResponse(html_path.read_text(encoding="utf-8"))


@app.post("/round/start")
async def round_start(request: Request):
    body = await request.json()
    ceo_text = body.get("text", "").strip()
    if not ceo_text:
        return JSONResponse({"error": "Kein Text"}, status_code=400)

    state["active"] = True
    state["round_num"] += 1
    state["history"] = []
    state["pending_role_idx"] = 0
    state["history"].append({"speaker": "CEO", "text": ceo_text})
    return {"ok": True, "round": state["round_num"]}


@app.post("/round/next")
async def round_next(request: Request):
    """CEO gibt Impuls, nächste Agenten-Iteration startet."""
    body = await request.json()
    ceo_text = body.get("text", "").strip()
    if ceo_text:
        state["history"].append({"speaker": "CEO", "text": ceo_text})
    state["pending_role_idx"] = 0
    return {"ok": True}


@app.post("/round/end")
async def round_end():
    """Runde beenden: Agenten schreiben in ihre MD-Dateien."""
    if not state["active"]:
        return JSONResponse({"error": "Keine aktive Runde"}, status_code=400)
    await write_round_summary(state["history"], state["round_num"])
    state["active"] = False
    state["history"] = []
    state["pending_role_idx"] = 0
    return {"ok": True}


@app.get("/stream")
async def stream(request: Request):
    """SSE-Stream: schickt die Antworten aller noch ausstehenden Agenten."""

    async def generator() -> AsyncGenerator[dict, None]:
        if not state["active"]:
            yield {"event": "done", "data": json.dumps({"reason": "no_active_round"})}
            return

        start_idx = state["pending_role_idx"]
        user_input_msgs = [m for m in state["history"] if m["speaker"] == "CEO"]
        last_ceo = user_input_msgs[-1]["text"] if user_input_msgs else ""

        for i in range(start_idx, len(ROLES)):
            role = ROLES[i]
            label = ROLE_LABELS[role]

            if await request.is_disconnected():
                break

            yield {"event": "speaker", "data": json.dumps({"role": role, "label": label})}

            full_text = ""
            async for chunk in stream_agent_response(role, state["history"], last_ceo):
                if await request.is_disconnected():
                    break
                full_text += chunk
                yield {"event": "chunk", "data": json.dumps({"role": role, "text": chunk})}

            state["history"].append({"speaker": label, "text": full_text})
            state["pending_role_idx"] = i + 1

            yield {"event": "agent_done", "data": json.dumps({"role": role})}
            await asyncio.sleep(0.3)

        yield {"event": "round_done", "data": "{}"}

    return EventSourceResponse(generator())


@app.get("/state")
async def get_state():
    return {
        "active": state["active"],
        "round_num": state["round_num"],
        "history": state["history"],
        "pending_role_idx": state["pending_role_idx"],
    }
