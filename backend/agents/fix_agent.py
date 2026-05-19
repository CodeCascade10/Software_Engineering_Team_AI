from graph.state import GraphState

from services.llm_service import groq_llm
from services.workflow_logger import save_workflow_log

from tools.file_tools import (
    save_file,
    append_log
)


llm = groq_llm()


def clean_code(code: str):

    code = code.replace("```python", "")
    code = code.replace("```", "")

    return code.strip()


def fix_agent(state: GraphState):

    append_log(
        "[Fix Agent] Improving backend code..."
    )

    backend_code = state.get(
        "backend_code",
        ""
    )

    project_id = state.get(
        "project_id"
    )

    if not backend_code:

        append_log(
            "[Fix Agent] No backend code found."
        )

        return {
            "backend_code": "",
            "active_model": "system-utility"
        }

    review_feedback = state.get(
        "review_feedback",
        ""
    )

    prompt = (
        f"You are a senior FastAPI engineer.\n\n"

        f"Improve the backend code using the review feedback.\n\n"

        f"REVIEW FEEDBACK:\n"
        f"{review_feedback}\n\n"

        f"ORIGINAL BACKEND CODE:\n"
        f"{backend_code}\n\n"

        f"REQUIREMENTS:\n"
        f"- improve scalability\n"
        f"- improve security\n"
        f"- fix bad practices\n"
        f"- optimize architecture\n"
        f"- improve JWT handling\n"
        f"- improve readability\n"
        f"- ensure valid FastAPI code\n\n"

        f"Return ONLY valid Python code.\n"
    )

    print("FIXER START")

    save_workflow_log(
        project_id,
        "fixer",
        "Fix process started"
    )

    response = llm.invoke(prompt)

    print("FIXER END")

    save_workflow_log(
        project_id,
        "fixer",
        "Fix process completed",
        "completed"
    )

    improved_code = clean_code(
        response.content
    )

    save_file(
        "generated_projects/generated_backend/improved_main.py",
        improved_code
    )

    append_log(
        "[Fix Agent] Backend improvements completed."
    )

    return {
        "backend_code": improved_code,
        "active_model": "groq-llama-3.3"
    }