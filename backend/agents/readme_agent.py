from graph.state import GraphState

from services.llm_service import groq_llm

from tools.file_tools import (
    save_file,
    append_log
)


llm = groq_llm()


def readme_agent(state: GraphState):

    append_log(
        "[README Agent] Generating project documentation..."
    )

    backend_summary = state.get(
        "backend_summary",
        ""
    )

    if not backend_summary:

        append_log(
            "[README Agent] No backend summary found."
        )

        return {
            "readme_content": (
                "No backend summary available."
            ),
            "active_model": "system-utility"
        }

    prompt = (
        f"You are a senior technical documentation engineer.\n\n"

        f"Generate a professional README.md file.\n\n"

        f"PROJECT DETAILS:\n"
        f"{backend_summary}\n\n"

        f"INCLUDE:\n"
        f"- Project title\n"
        f"- Features\n"
        f"- Architecture overview\n"
        f"- Backend stack\n"
        f"- Frontend stack\n"
        f"- Installation steps\n"
        f"- Usage instructions\n"
        f"- Docker setup\n"
        f"- API overview\n"
        f"- Future improvements\n\n"

        f"Return ONLY markdown content.\n"
    )

    response = llm.invoke(prompt)

    readme_content = response.content

    save_file(
        "generated_projects/README.md",
        readme_content
    )

    append_log(
        "[README Agent] README generated successfully."
    )

    return {
        "readme_content": readme_content,
        "active_model": "groq-llama-3.3"
    }