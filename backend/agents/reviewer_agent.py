from graph.state import GraphState

from services.llm_service import groq_llm
from services.workflow_logger import save_workflow_log

from tools.file_tools import append_log


llm = groq_llm()


def reviewer_agent(state: GraphState):

    append_log(
        "[Reviewer Agent] Reviewing backend code..."
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
            "[Reviewer Agent] No backend code found."
        )

        return {
            "review_feedback": "",
            "active_model": "system-utility"
        }

    prompt = (
        f"You are a senior code reviewer.\n\n"

        f"Review the following backend code.\n\n"

        f"Focus on:\n"
        f"- security\n"
        f"- scalability\n"
        f"- architecture\n"
        f"- clean code\n"
        f"- JWT issues\n"
        f"- database issues\n\n"

        f"CODE:\n\n"
        f"{backend_code}\n\n"

        f"Return detailed review feedback."
    )

    print("REVIEWER START")

    save_workflow_log(
        project_id,
        "reviewer",
        "Code review started"
    )

    response = llm.invoke(prompt)

    print("REVIEWER END")

    save_workflow_log(
        project_id,
        "reviewer",
        "Code review completed",
        "completed"
    )

    feedback = response.content

    append_log(
        "[Reviewer Agent] Review completed."
    )

    return {
        "review_feedback": feedback,
        "active_model": "groq-llama-3.3"
    }