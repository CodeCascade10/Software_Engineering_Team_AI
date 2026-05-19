from graph.state import GraphState

from services.llm_service import groq_llm

from tools.file_tools import append_log


llm = groq_llm()


def reviewer_agent(state: GraphState):

    append_log(
        "[Reviewer Agent] Reviewing generated backend code..."
    )

    backend_code = state.get(
        "backend_code",
        ""
    )

    if not backend_code:

        append_log(
            "[Reviewer Agent] No backend code found."
        )

        return {
            "review_feedback": (
                "No backend code generated."
            ),
            "active_model": "system-utility"
        }

    prompt = (
        f"You are a senior software code reviewer.\n\n"

        f"Review the following FastAPI backend code.\n\n"

        f"CHECK FOR:\n"
        f"- security vulnerabilities\n"
        f"- JWT authentication mistakes\n"
        f"- scalability issues\n"
        f"- bad coding practices\n"
        f"- missing imports\n"
        f"- invalid FastAPI patterns\n"
        f"- code readability\n"
        f"- architecture quality\n\n"

        f"PROVIDE:\n"
        f"- strengths\n"
        f"- weaknesses\n"
        f"- improvements\n"
        f"- optimization suggestions\n\n"

        f"BACKEND CODE:\n"
        f"{backend_code}\n"
    )

    response = llm.invoke(prompt)

    append_log(
        "[Reviewer Agent] Code review completed."
    )

    return {
        "review_feedback": response.content,
        "active_model": "groq-llama-3.3"
    }