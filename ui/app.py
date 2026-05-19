import sys
import os
import time
import threading

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import streamlit as st

from tools.zip_tools import zip_project_folder
from tools.project_tools import get_project_files
from tools.file_tools import read_logs

# ── Page Config ────────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="AI Engineering Team",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ── Injected CSS ───────────────────────────────────────────────────────────────
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Outfit:wght@300;400;600;700;800&display=swap');

/* ── Reset & Base ── */
*, *::before, *::after { box-sizing: border-box; }

:root {
    --orange:      #ff5a32;
    --orange-dim:  rgba(255, 90, 50, 0.15);
    --orange-glow: rgba(255, 90, 50, 0.40);
    --blue:        #3d8bff;
    --blue-dim:    rgba(61, 139, 255, 0.12);
    --cyan:        #00e5ff;
    --green:       #39ff8e;
    --green-dim:   rgba(57, 255, 142, 0.10);
    --bg:          #070710;
    --surface:     #0d0d1a;
    --surface2:    #121224;
    --border:      rgba(255, 255, 255, 0.07);
    --text:        #f0ece4;
    --muted:       rgba(240, 236, 228, 0.45);
}

html,
body,
[data-testid="stAppViewContainer"] {
    background: var(--bg) !important;
    color: var(--text) !important;
    font-family: 'Outfit', sans-serif !important;
}

/* Ambient orbs via pseudo-element on the app container */
[data-testid="stAppViewContainer"]::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
        radial-gradient(ellipse 70% 55% at 10%  5%,  rgba(255, 90,  50, 0.10) 0%, transparent 65%),
        radial-gradient(ellipse 55% 55% at 88% 92%,  rgba(61, 139, 255, 0.09) 0%, transparent 65%),
        radial-gradient(ellipse 40% 40% at 60%  50%, rgba(0,  229, 255, 0.06) 0%, transparent 65%);
    pointer-events: none;
    z-index: 0;
    animation: orb-drift 14s ease-in-out infinite alternate;
}

@keyframes orb-drift {
    0%   { opacity: 1;    transform: scale(1); }
    100% { opacity: 0.85; transform: scale(1.06) translate(15px, 10px); }
}

/* Hide Streamlit chrome */
[data-testid="stHeader"],
footer,
#MainMenu { display: none !important; }
[data-testid="stSidebar"] { display: none !important; }

/* ── Main container ── */
.block-container {
    max-width: 1060px !important;
    padding: 3rem 2rem 5rem !important;
    margin: 0 auto !important;
    position: relative;
    z-index: 1;
}

/* ── Hero ── */
.hero-wrap {
    position: relative;
    padding: 3.5rem 0 2.5rem;
    margin-bottom: 2.5rem;
    border-bottom: 1px solid var(--border);
}

.hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-family: 'Space Mono', monospace;
    font-size: 0.62rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--orange);
    border: 1px solid var(--orange-glow);
    background: var(--orange-dim);
    border-radius: 100px;
    padding: 5px 14px;
    margin-bottom: 1.3rem;
    box-shadow: 0 0 14px var(--orange-glow);
}

.pulse-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--orange);
    box-shadow: 0 0 10px var(--orange);
    animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1;   transform: scale(1); }
    50%       { opacity: 0.3; transform: scale(0.55); }
}

.hero-title {
    font-size: clamp(2.6rem, 5.5vw, 4.2rem);
    font-weight: 800;
    line-height: 1.0;
    letter-spacing: -0.04em;
    color: var(--text);
    margin: 0 0 0.75rem;
}

.hero-title .glow {
    color: var(--orange);
    text-shadow:
        0 0 35px rgba(255, 90, 50, 0.75),
        0 0 70px  rgba(255, 90, 50, 0.35),
        0 0 120px rgba(255, 90, 50, 0.15);
    animation: title-glow 3s ease-in-out infinite alternate;
}

@keyframes title-glow {
    0%   { text-shadow: 0 0 30px rgba(255,90,50,0.6), 0 0 60px rgba(255,90,50,0.25); }
    100% { text-shadow: 0 0 60px rgba(255,90,50,0.95), 0 0 120px rgba(255,90,50,0.45); }
}

.hero-sub {
    font-size: 1rem;
    color: var(--muted);
    max-width: 470px;
    line-height: 1.65;
    font-weight: 300;
}

/* ── Agent Pills ── */
.agents-row {
    display: flex;
    gap: 0.65rem;
    flex-wrap: wrap;
    margin-bottom: 2.6rem;
}

.agent-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 100px;
    padding: 6px 14px 6px 10px;
    font-family: 'Space Mono', monospace;
    font-size: 0.66rem;
    color: var(--muted);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    transition: all 0.2s;
}

.agent-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}

.dot-orange { background: var(--orange); box-shadow: 0 0 10px var(--orange-glow); }
.dot-amber  { background: #ffa040;       box-shadow: 0 0 10px rgba(255,160,64,0.5); }
.dot-blue   { background: var(--blue);   box-shadow: 0 0 10px rgba(61,139,255,0.5); }
.dot-green  { background: var(--green);  box-shadow: 0 0 10px rgba(57,255,142,0.5); }

/* ── Textarea ── */
[data-testid="stTextArea"] label {
    font-family: 'Space Mono', monospace !important;
    font-size: 0.64rem !important;
    letter-spacing: 0.2em !important;
    text-transform: uppercase !important;
    color: rgba(240, 236, 228, 0.35) !important;
    margin-bottom: 0.65rem !important;
}

[data-testid="stTextArea"] textarea {
    background: rgba(255, 255, 255, 0.025) !important;
    border: 1px solid rgba(255, 90, 50, 0.22) !important;
    border-radius: 14px !important;
    color: var(--text) !important;
    font-family: 'Outfit', sans-serif !important;
    font-size: 0.97rem !important;
    font-weight: 300 !important;
    line-height: 1.65 !important;
    padding: 1.1rem 1.3rem !important;
    caret-color: var(--orange) !important;
    resize: vertical !important;
    min-height: 140px !important;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s !important;
}

[data-testid="stTextArea"] textarea:focus {
    border-color: rgba(255, 90, 50, 0.55) !important;
    background: rgba(255, 255, 255, 0.04) !important;
    outline: none !important;
    box-shadow:
        0 0 0 4px rgba(255, 90, 50, 0.08),
        0 0 30px rgba(255, 90, 50, 0.07) !important;
}

[data-testid="stTextArea"] textarea::placeholder {
    color: rgba(240, 236, 228, 0.2) !important;
}

/* ── Button ── */
[data-testid="stButton"] button {
    background: var(--orange) !important;
    color: #070710 !important;
    border: none !important;
    border-radius: 10px !important;
    font-family: 'Space Mono', monospace !important;
    font-size: 0.74rem !important;
    font-weight: 700 !important;
    letter-spacing: 0.12em !important;
    text-transform: uppercase !important;
    padding: 0.78rem 2rem !important;
    cursor: pointer !important;
    margin-top: 1rem !important;
    box-shadow:
        0 0 20px rgba(255, 90, 50, 0.45),
        0 4px 20px rgba(255, 90, 50, 0.30) !important;
    transition: transform 0.15s, box-shadow 0.15s, background 0.15s !important;
}

[data-testid="stButton"] button:hover {
    background: #ff7a52 !important;
    box-shadow:
        0 0 40px rgba(255, 90, 50, 0.70),
        0 8px 32px rgba(255, 90, 50, 0.45) !important;
    transform: translateY(-2px) !important;
}

[data-testid="stButton"] button:active {
    transform: translateY(0) !important;
}

/* Download button variant */
[data-testid="stDownloadButton"] button {
    background: transparent !important;
    color: var(--text) !important;
    border: 1px solid rgba(255, 255, 255, 0.15) !important;
    border-radius: 10px !important;
    font-family: 'Space Mono', monospace !important;
    font-size: 0.7rem !important;
    font-weight: 700 !important;
    letter-spacing: 0.1em !important;
    text-transform: uppercase !important;
    padding: 0.65rem 1.6rem !important;
    cursor: pointer !important;
    margin-top: 1rem !important;
    transition: all 0.2s !important;
}

[data-testid="stDownloadButton"] button:hover {
    background: rgba(255, 255, 255, 0.05) !important;
    border-color: rgba(255, 90, 50, 0.45) !important;
    color: var(--orange) !important;
    box-shadow: 0 0 16px rgba(255, 90, 50, 0.18) !important;
}

/* ── Divider ── */
.section-divider {
    border: none;
    border-top: 1px solid var(--border);
    margin: 2.5rem 0;
}

/* ── Section heading ── */
.section-head {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    margin-bottom: 1.2rem;
}

.section-num {
    font-family: 'Space Mono', monospace;
    font-size: 0.6rem;
    color: var(--orange);
    background: var(--orange-dim);
    border: 1px solid rgba(255, 90, 50, 0.28);
    border-radius: 5px;
    padding: 3px 8px;
    letter-spacing: 0.08em;
    box-shadow: 0 0 10px rgba(255, 90, 50, 0.20);
}

.section-title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text);
    letter-spacing: -0.01em;
}

/* ── Task Cards ── */
.tasks-grid {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
}

.task-card {
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-left: 3px solid var(--orange);
    border-radius: 0 10px 10px 0;
    padding: 0.75rem 1.1rem;
    font-size: 0.88rem;
    color: rgba(240, 236, 228, 0.8);
    line-height: 1.5;
    box-shadow: -3px 0 16px rgba(255, 90, 50, 0.14);
    transition: all 0.15s;
}

.task-card:hover {
    background: rgba(255, 255, 255, 0.04);
    border-left-color: #ff7a52;
    box-shadow: -3px 0 28px rgba(255, 90, 50, 0.32);
    transform: translateX(3px);
}

.task-index {
    font-family: 'Space Mono', monospace;
    font-size: 0.58rem;
    color: rgba(255, 90, 50, 0.5);
    margin-right: 0.5rem;
    letter-spacing: 0.05em;
}

/* ── Code Block ── */
[data-testid="stCode"] {
    border-radius: 14px !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    overflow: hidden !important;
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.5) !important;
}

[data-testid="stCode"] > div {
    background: #06060f !important;
    border-radius: 14px !important;
}

[data-testid="stCode"] pre {
    background: #06060f !important;
    font-family: 'Space Mono', monospace !important;
    font-size: 0.76rem !important;
    line-height: 1.75 !important;
    color: #a8ffc0 !important;
}

/* ── Review Card ── */
.review-card {
    background: rgba(61, 139, 255, 0.05);
    border: 1px solid rgba(61, 139, 255, 0.18);
    border-radius: 12px;
    padding: 1.3rem 1.5rem;
    font-size: 0.9rem;
    color: rgba(240, 236, 228, 0.75);
    line-height: 1.75;
    box-shadow: 0 0 24px rgba(61, 139, 255, 0.06);
}

.review-card strong,
.review-card b {
    color: var(--text);
}

/* ── Execution Output ── */
.exec-card {
    background: #050509;
    border: 1px solid rgba(57, 255, 142, 0.14);
    border-radius: 12px;
    padding: 1.1rem 1.4rem;
    font-family: 'Space Mono', monospace;
    font-size: 0.73rem;
    color: var(--green);
    line-height: 1.8;
    white-space: pre-wrap;
    word-break: break-all;
    box-shadow:
        0 0 20px rgba(57, 255, 142, 0.07),
        inset 0 1px 0 rgba(57, 255, 142, 0.05);
}

/* ── Info / Spinner ── */
[data-testid="stInfo"] {
    background: rgba(61, 139, 255, 0.07) !important;
    border: 1px solid rgba(61, 139, 255, 0.20) !important;
    border-radius: 10px !important;
    color: rgba(240, 236, 228, 0.7) !important;
    font-family: 'Outfit', sans-serif !important;
    font-size: 0.88rem !important;
    box-shadow: 0 0 16px rgba(61, 139, 255, 0.07) !important;
}

[data-testid="stSuccess"] {
    background: rgba(57, 255, 142, 0.07) !important;
    border: 1px solid rgba(57, 255, 142, 0.22) !important;
    border-radius: 10px !important;
    color: rgba(57, 255, 142, 0.85) !important;
    font-family: 'Outfit', sans-serif !important;
    font-size: 0.88rem !important;
    box-shadow: 0 0 16px rgba(57, 255, 142, 0.08) !important;
}

[data-testid="stSpinner"] {
    color: var(--orange) !important;
}

[data-testid="stSpinner"] > div > div {
    border-top-color: var(--orange) !important;
    box-shadow: 0 0 8px rgba(255, 90, 50, 0.5) !important;
}

/* ── Expander ── */
[data-testid="stExpander"] {
    background: rgba(255, 255, 255, 0.025) !important;
    border: 1px solid rgba(255, 255, 255, 0.07) !important;
    border-radius: 10px !important;
    overflow: hidden !important;
    margin-bottom: 0.5rem !important;
}

[data-testid="stExpander"] summary {
    font-family: 'Space Mono', monospace !important;
    font-size: 0.7rem !important;
    color: var(--muted) !important;
    letter-spacing: 0.06em !important;
    padding: 0.75rem 1rem !important;
    background: rgba(255, 255, 255, 0.02) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
    transition: background 0.15s, color 0.15s !important;
}

[data-testid="stExpander"] summary:hover {
    background: rgba(255, 255, 255, 0.04) !important;
    color: var(--text) !important;
}

[data-testid="stExpander"] summary svg {
    fill: rgba(255, 90, 50, 0.6) !important;
}

/* ── Warning ── */
[data-testid="stWarning"] {
    background: rgba(255, 160, 64, 0.07) !important;
    border: 1px solid rgba(255, 160, 64, 0.22) !important;
    border-radius: 10px !important;
    color: rgba(255, 160, 64, 0.85) !important;
    font-size: 0.88rem !important;
}

/* ── Error ── */
[data-testid="stError"] {
    background: rgba(255, 50, 50, 0.07) !important;
    border: 1px solid rgba(255, 50, 50, 0.22) !important;
    border-radius: 10px !important;
    font-size: 0.88rem !important;
}
</style>
""", unsafe_allow_html=True)

# ── Hero Section ───────────────────────────────────────────────────────────────
st.markdown("""
<div class="hero-wrap">
    <div class="hero-badge">
        <div class="pulse-dot"></div>
        v2.0 · Multi-Agent System
    </div>
    <h1 class="hero-title">
        AI Software<br>
        <span class="glow">Engineering Team</span>
    </h1>
    <p class="hero-sub">
        Describe your idea. A team of specialised agents will plan,
        build, review, and run your project automatically.
    </p>
</div>
""", unsafe_allow_html=True)

# ── Agent Pills ────────────────────────────────────────────────────────────────
st.markdown("""
<div class="agents-row">
    <div class="agent-pill"><div class="agent-dot dot-orange"></div>Planner</div>
    <div class="agent-pill"><div class="agent-dot dot-amber"></div>Backend Dev</div>
    <div class="agent-pill"><div class="agent-dot dot-blue"></div>Code Reviewer</div>
    <div class="agent-pill"><div class="agent-dot dot-green"></div>Executor</div>
</div>
""", unsafe_allow_html=True)

# ── Input ──────────────────────────────────────────────────────────────────────
user_input = st.text_area(
    "Describe your project",
    placeholder="e.g. Build a REST API that tracks habits with SQLite, "
                "auth via JWT, and a /stats endpoint returning weekly streaks…",
    height=140,
    label_visibility="visible",
)

col_btn, col_spacer = st.columns([1, 4])
with col_btn:
    generate = st.button("⟶  Generate", use_container_width=True)

# ── Generation ─────────────────────────────────────────────────────────────────
if generate:

    if not user_input.strip():
        st.info("Please describe your project idea before generating.")

    else:
        status_box = st.empty()
        log_box    = st.empty()

        status_box.info("Initializing AI agents…")

        try:
            from graph.builder import build_graph

            app = build_graph()

            status_steps = [
                "Planner Agent is analyzing project…",
                "Backend Agent is generating architecture…",
                "Reviewer Agent is reviewing backend…",
                "Fix Agent is improving generated code…",
                "Debug Agent is executing backend…",
                "Test Agent is validating API endpoints…",
            ]

            for msg in status_steps:
                status_box.info(msg)
                time.sleep(0.3)

            result_container = {}

            def run_workflow():
                result_container["result"] = app.invoke({
                    "user_prompt": user_input,
                    "retry_count": 0,
                })

            workflow_thread = threading.Thread(target=run_workflow)
            workflow_thread.start()

            while workflow_thread.is_alive():
                logs = read_logs()
                log_box.code(logs, language="bash")
                time.sleep(0.5)

            workflow_thread.join()
            result = result_container["result"]

            status_box.success("✓  Project generation completed successfully.")

        except Exception as e:
            st.error(f"System Error: {e}")
            st.stop()

        # ── Live log (final flush) ─────────────────────────────────────────────
        try:
            with open("logs/workflow_logs/system.log", "r", encoding="utf-8") as fh:
                logs = fh.read()
            log_box.code(logs, language="bash")
        except FileNotFoundError:
            pass

        st.markdown('<hr class="section-divider">', unsafe_allow_html=True)

        # ── 01 · Planned Tasks ─────────────────────────────────────────────────
        tasks = [t for t in result.get("tasks", []) if t.strip()]

        if tasks:
            st.markdown("""
            <div class="section-head">
                <span class="section-num">01</span>
                <span class="section-title">Planned Tasks</span>
            </div>
            """, unsafe_allow_html=True)

            tasks_html = '<div class="tasks-grid">'
            for idx, task in enumerate(tasks, 1):
                num = str(idx).zfill(2)
                tasks_html += f"""
                <div class="task-card">
                    <span class="task-index">{num}.</span>{task}
                </div>"""
            tasks_html += "</div>"

            st.markdown(tasks_html, unsafe_allow_html=True)
            st.markdown('<hr class="section-divider">', unsafe_allow_html=True)

        # ── 02 · Generated Backend Code ───────────────────────────────────────
        backend_code = result.get("backend_code", "")

        if backend_code:
            st.markdown("""
            <div class="section-head">
                <span class="section-num">02</span>
                <span class="section-title">Generated Backend Code</span>
            </div>
            """, unsafe_allow_html=True)

            st.code(backend_code, language="python")
            st.markdown('<hr class="section-divider">', unsafe_allow_html=True)

        # ── 03 · Generated Project Files ──────────────────────────────────────
        project_files = get_project_files("generated_projects/generated_backend")

        if project_files:
            st.markdown("""
            <div class="section-head">
                <span class="section-num">03</span>
                <span class="section-title">Generated Project Files</span>
            </div>
            """, unsafe_allow_html=True)

            for file_data in project_files:
                with st.expander(file_data["filename"]):
                    st.code(file_data["content"], language="python")

            st.markdown('<hr class="section-divider">', unsafe_allow_html=True)

        # ── 04 · Code Review Feedback ─────────────────────────────────────────
        review_feedback = result.get("review_feedback", "")

        if review_feedback:
            st.markdown("""
            <div class="section-head">
                <span class="section-num">04</span>
                <span class="section-title">Code Review Feedback</span>
            </div>
            """, unsafe_allow_html=True)

            st.markdown(
                f'<div class="review-card">{review_feedback}</div>',
                unsafe_allow_html=True,
            )
            st.markdown('<hr class="section-divider">', unsafe_allow_html=True)

        # ── 05 · Execution Output ─────────────────────────────────────────────
        execution_output = result.get("execution_output", "")

        if execution_output:
            st.markdown("""
            <div class="section-head">
                <span class="section-num">05</span>
                <span class="section-title">Execution Output</span>
            </div>
            """, unsafe_allow_html=True)

            st.markdown(
                f'<div class="exec-card">{execution_output}</div>',
                unsafe_allow_html=True,
            )
            st.markdown('<hr class="section-divider">', unsafe_allow_html=True)

        # ── 06 · Agent Workflow Logs ──────────────────────────────────────────
        try:
            with open("logs/workflow_logs/system.log", "r", encoding="utf-8") as fh:
                logs = fh.read()

            st.markdown("""
            <div class="section-head">
                <span class="section-num">06</span>
                <span class="section-title">Agent Workflow Logs</span>
            </div>
            """, unsafe_allow_html=True)

            st.markdown(
                f'<div class="exec-card">{logs}</div>',
                unsafe_allow_html=True,
            )

        except FileNotFoundError:
            st.warning("Workflow log file not found.")

        st.markdown('<hr class="section-divider">', unsafe_allow_html=True)

        # ── Download Generated Project ─────────────────────────────────────────
        zip_path = zip_project_folder(
            "generated_projects/generated_backend",
            "generated_projects/generated_backend.zip",
        )

        with open(zip_path, "rb") as fh:
            st.download_button(
                label="⬇  Download Generated Project",
                data=fh,
                file_name="generated_backend.zip",
                mime="application/zip",
            )

        st.markdown('<hr class="section-divider">', unsafe_allow_html=True)
