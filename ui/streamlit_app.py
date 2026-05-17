import sys
import os

sys.path.append(
    os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
)
import streamlit as st
import time

from tools.project_tools import get_project_files
# ── Page config ────────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="AI Engineering Team",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ── Custom CSS ─────────────────────────────────────────────────────────────────
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');

/* ── Reset & Base ── */
*, *::before, *::after { box-sizing: border-box; }

html, body, [data-testid="stAppViewContainer"] {
    background: #0a0a0f !important;
    color: #e8e4dc !important;
    font-family: 'Syne', sans-serif !important;
}

[data-testid="stAppViewContainer"] {
    background:
        radial-gradient(ellipse 80% 50% at 20% 10%, rgba(255,90,50,0.07) 0%, transparent 60%),
        radial-gradient(ellipse 60% 60% at 80% 90%, rgba(50,100,255,0.06) 0%, transparent 60%),
        #0a0a0f !important;
}

/* Hide Streamlit chrome */
[data-testid="stHeader"], footer, #MainMenu { display: none !important; }
[data-testid="stSidebar"] { display: none !important; }

/* ── Main container ── */
.block-container {
    max-width: 1100px !important;
    padding: 3rem 2rem 4rem !important;
    margin: 0 auto !important;
}

/* ── Hero header ── */
.hero-wrap {
    position: relative;
    padding: 3.5rem 0 2.5rem;
    margin-bottom: 2.5rem;
    border-bottom: 1px solid rgba(255,255,255,0.07);
}
.hero-label {
    font-family: 'Space Mono', monospace;
    font-size: 0.68rem;
    letter-spacing: 0.25em;
    color: #ff5a32;
    text-transform: uppercase;
    margin-bottom: 0.9rem;
}
.hero-title {
    font-size: clamp(2.4rem, 5vw, 3.8rem);
    font-weight: 800;
    line-height: 1.05;
    color: #f0ece4;
    margin: 0 0 0.7rem;
    letter-spacing: -0.03em;
}
.hero-title span {
    color: #ff5a32;
}
.hero-sub {
    font-size: 1rem;
    color: rgba(232,228,220,0.5);
    font-weight: 400;
    max-width: 480px;
    line-height: 1.6;
}
.hero-badge {
    position: absolute;
    top: 3.5rem;
    right: 0;
    font-family: 'Space Mono', monospace;
    font-size: 0.62rem;
    letter-spacing: 0.12em;
    color: rgba(255,255,255,0.25);
    text-transform: uppercase;
    writing-mode: vertical-rl;
    text-orientation: mixed;
}

/* ── Agent row ── */
.agents-row {
    display: flex;
    gap: 1rem;
    margin-bottom: 2.5rem;
    flex-wrap: wrap;
}
.agent-pill {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 100px;
    padding: 0.45rem 1rem;
    font-family: 'Space Mono', monospace;
    font-size: 0.7rem;
    color: rgba(232,228,220,0.6);
    letter-spacing: 0.05em;
}
.agent-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
}

/* ── Textarea overrides ── */
[data-testid="stTextArea"] label {
    font-family: 'Space Mono', monospace !important;
    font-size: 0.7rem !important;
    letter-spacing: 0.18em !important;
    text-transform: uppercase !important;
    color: rgba(232,228,220,0.45) !important;
    margin-bottom: 0.6rem !important;
}

[data-testid="stTextArea"] textarea {
    background: rgba(255,255,255,0.025) !important;
    border: 1px solid rgba(255,255,255,0.1) !important;
    border-radius: 12px !important;
    color: #f0ece4 !important;
    font-family: 'Syne', sans-serif !important;
    font-size: 1rem !important;
    line-height: 1.65 !important;
    padding: 1.1rem 1.3rem !important;
    caret-color: #ff5a32 !important;
    transition: border-color 0.2s, background 0.2s !important;
    resize: vertical !important;
    min-height: 130px !important;
}

[data-testid="stTextArea"] textarea:focus {
    border-color: rgba(255,90,50,0.5) !important;
    background: rgba(255,255,255,0.04) !important;
    outline: none !important;
    box-shadow: 0 0 0 3px rgba(255,90,50,0.08) !important;
}

[data-testid="stTextArea"] textarea::placeholder {
    color: rgba(232,228,220,0.2) !important;
}

/* ── Button ── */
[data-testid="stButton"] button {
    background: #ff5a32 !important;
    color: #0a0a0f !important;
    border: none !important;
    border-radius: 10px !important;
    font-family: 'Space Mono', monospace !important;
    font-size: 0.78rem !important;
    font-weight: 700 !important;
    letter-spacing: 0.12em !important;
    text-transform: uppercase !important;
    padding: 0.75rem 2rem !important;
    cursor: pointer !important;
    transition: transform 0.15s, box-shadow 0.15s, background 0.15s !important;
    box-shadow: 0 0 0 0 rgba(255,90,50,0) !important;
    margin-top: 1rem !important;
}

[data-testid="stButton"] button:hover {
    background: #ff7a52 !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 30px rgba(255,90,50,0.3) !important;
}

[data-testid="stButton"] button:active {
    transform: translateY(0) !important;
}

/* ── Divider ── */
.section-divider {
    border: none;
    border-top: 1px solid rgba(255,255,255,0.06);
    margin: 2.5rem 0;
}

/* ── Section heading ── */
.section-head {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    margin-bottom: 1.2rem;
}
.section-num {
    font-family: 'Space Mono', monospace;
    font-size: 0.65rem;
    color: #ff5a32;
    letter-spacing: 0.1em;
    background: rgba(255,90,50,0.1);
    border: 1px solid rgba(255,90,50,0.25);
    border-radius: 5px;
    padding: 0.25rem 0.55rem;
}
.section-title {
    font-size: 1.05rem;
    font-weight: 700;
    color: #f0ece4;
    letter-spacing: -0.01em;
}

/* ── Task cards ── */
.tasks-grid {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
}
.task-card {
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.07);
    border-left: 3px solid #ff5a32;
    border-radius: 0 10px 10px 0;
    padding: 0.8rem 1.1rem;
    font-size: 0.9rem;
    color: rgba(232,228,220,0.8);
    line-height: 1.5;
    transition: background 0.15s, border-left-color 0.15s;
}
.task-card:hover {
    background: rgba(255,255,255,0.04);
    border-left-color: #ff7a52;
}
.task-index {
    font-family: 'Space Mono', monospace;
    font-size: 0.6rem;
    color: rgba(255,90,50,0.6);
    margin-right: 0.6rem;
    letter-spacing: 0.05em;
}

/* ── Code block ── */
[data-testid="stCode"] {
    border-radius: 12px !important;
    border: 1px solid rgba(255,255,255,0.08) !important;
    overflow: hidden !important;
}
[data-testid="stCode"] > div {
    background: #0e0e16 !important;
    border-radius: 12px !important;
}
[data-testid="stCode"] pre {
    background: #0e0e16 !important;
    font-family: 'Space Mono', monospace !important;
    font-size: 0.78rem !important;
    line-height: 1.7 !important;
    color: #c8ffc0 !important;
}

/* ── Review feedback card ── */
.review-card {
    background: rgba(50,100,255,0.04);
    border: 1px solid rgba(50,100,255,0.15);
    border-radius: 12px;
    padding: 1.4rem 1.6rem;
    font-size: 0.92rem;
    color: rgba(232,228,220,0.75);
    line-height: 1.75;
}
.review-card strong, .review-card b {
    color: #e8e4dc;
}

/* ── Execution output ── */
.exec-card {
    background: #070709;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    padding: 1.2rem 1.5rem;
    font-family: 'Space Mono', monospace;
    font-size: 0.76rem;
    color: #a8ffb8;
    line-height: 1.8;
    white-space: pre-wrap;
    word-break: break-all;
}

/* ── Spinner ── */
[data-testid="stSpinner"] {
    color: #ff5a32 !important;
}
[data-testid="stSpinner"] > div > div {
    border-top-color: #ff5a32 !important;
}

/* ── Info / warning ── */
[data-testid="stInfo"] {
    background: rgba(50,100,255,0.06) !important;
    border: 1px solid rgba(50,100,255,0.2) !important;
    border-radius: 10px !important;
    color: rgba(232,228,220,0.7) !important;
    font-size: 0.88rem !important;
}
</style>
""", unsafe_allow_html=True)

# ── Hero ───────────────────────────────────────────────────────────────────────
st.markdown("""
<div class="hero-wrap">
    <div class="hero-badge">v2.0 · multi-agent</div>
    <div class="hero-label">Powered by AI Agents</div>
    <h1 class="hero-title">AI Software<br><span>Engineering Team</span></h1>
    <p class="hero-sub">Describe your idea. A team of specialised agents will plan, build, review, and run your project automatically.</p>
</div>
""", unsafe_allow_html=True)

# ── Agent pills ────────────────────────────────────────────────────────────────
st.markdown("""
<div class="agents-row">
    <div class="agent-pill"><div class="agent-dot" style="background:#ff5a32;"></div>Planner</div>
    <div class="agent-pill"><div class="agent-dot" style="background:#ffa040;"></div>Backend Dev</div>
    <div class="agent-pill"><div class="agent-dot" style="background:#40c8ff;"></div>Code Reviewer</div>
    <div class="agent-pill"><div class="agent-dot" style="background:#a8ffb8;"></div>Executor</div>
</div>
""", unsafe_allow_html=True)

# ── Input ──────────────────────────────────────────────────────────────────────
user_input = st.text_area(
    "Describe your project",
    placeholder="e.g. Build a REST API that tracks habits with SQLite, auth via JWT, and a /stats endpoint returning weekly streaks…",
    height=140,
    label_visibility="visible",
)

col_btn, col_spacer = st.columns([1, 4])
with col_btn:
    generate = st.button("⟶  Generate", use_container_width=True)

# ── Generation ─────────────────────────────────────────────────────────────────
# ── Generation ─────────────────────────────────────────────────────────────────
if generate:

    if not user_input.strip():

        st.info(
            "Please describe your project idea before generating."
        )

    else:

        with st.spinner("AI agents are collaborating..."):

            try:

                from graph.builder import build_graph

                app = build_graph()

                result = app.invoke({
                    "user_prompt": user_input
                })

            except Exception as e:

                st.error(f"System Error: {e}")

                st.stop()

        st.success("Project generation completed successfully.")

        st.markdown(
            '<hr class="section-divider">',
            unsafe_allow_html=True
        )

        # ── Planned Tasks ─────────────────────────────────────
        tasks = [
            task
            for task in result.get("tasks", [])
            if task.strip()
        ]

        if tasks:

            st.markdown("""
            <div class="section-head">
                <span class="section-num">01</span>
                <span class="section-title">Planned Tasks</span>
            </div>
            """, unsafe_allow_html=True)

            tasks_html = '<div class="tasks-grid">'

            for index, task in enumerate(tasks, 1):

                task_number = str(index).zfill(2)

                tasks_html += f"""
                <div class="task-card">
                    <span class="task-index">
                        {task_number}.
                    </span>
                    {task}
                </div>
                """

            tasks_html += '</div>'

            st.markdown(
                tasks_html,
                unsafe_allow_html=True
            )

            st.markdown(
                '<hr class="section-divider">',
                unsafe_allow_html=True
            )

        # ── Backend Code ─────────────────────────────────────
        backend_code = result.get("backend_code", "")

        if backend_code:

            st.markdown("""
            <div class="section-head">
                <span class="section-num">02</span>
                <span class="section-title">Generated Backend Code</span>
            </div>
            """, unsafe_allow_html=True)

            st.code(
                backend_code,
                language="python"
            )

            st.markdown(
                '<hr class="section-divider">',
                unsafe_allow_html=True
            )

# ── Generated Project Files ─────────────────────────

            project_files = get_project_files(
                "generated_projects/generated_backend"
            )

            if project_files:

                st.markdown("""
                <div class="section-head">
                    <span class="section-num">03</span>
                    <span class="section-title">Generated Project Files</span>
                </div>
                """, unsafe_allow_html=True)

                for file_data in project_files:

                    with st.expander(file_data["filename"]):

                        st.code(
                            file_data["content"],
                            language="python"
                        )

                st.markdown(
                    '<hr class="section-divider">',
                    unsafe_allow_html=True
                )

           

        # ── Review Feedback ─────────────────────────────────
        review_feedback = result.get(
            "review_feedback",
            ""
        )

        if review_feedback:

            st.markdown("""
            <div class="section-head">
                <span class="section-num">03</span>
                <span class="section-title">Code Review Feedback</span>
            </div>
            """, unsafe_allow_html=True)

            st.markdown(
                f'''
                <div class="review-card">
                    {review_feedback}
                </div>
                ''',
                unsafe_allow_html=True
            )

            st.markdown(
                '<hr class="section-divider">',
                unsafe_allow_html=True
            )

        # ── Execution Output ────────────────────────────────
        execution_output = result.get(
            "execution_output",
            ""
        )

        if execution_output:

            st.markdown("""
            <div class="section-head">
                <span class="section-num">04</span>
                <span class="section-title">Execution Output</span>
            </div>
            """, unsafe_allow_html=True)

            st.markdown(
                f'''
                <div class="exec-card">
                    {execution_output}
                </div>
                ''',
                unsafe_allow_html=True
            )

            st.markdown(
                '<hr class="section-divider">',
                unsafe_allow_html=True
            )

        # ── Workflow Logs ───────────────────────────────────
        try:

            with open(
                "logs/workflow_logs/system.log",
                "r",
                encoding="utf-8"
            ) as file:

                logs = file.read()

            st.markdown("""
            <div class="section-head">
                <span class="section-num">05</span>
                <span class="section-title">Agent Workflow Logs</span>
            </div>
            """, unsafe_allow_html=True)

            st.markdown(
                f'''
                <div class="exec-card">
                    {logs}
                </div>
                ''',
                unsafe_allow_html=True
            )

        except FileNotFoundError:

            st.warning("Workflow log file not found.")