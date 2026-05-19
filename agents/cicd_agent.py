from graph.state import GraphState

from tools.file_tools import (
    append_log,
    save_cicd_files
)


def cicd_agent(state: GraphState):

    append_log(
        "[CI/CD Agent] Generating GitHub Actions pipeline..."
    )

    save_cicd_files()

    append_log(
        "[CI/CD Agent] CI/CD workflow generated successfully."
    )

    return {
        "cicd_status": (
            "CI/CD pipeline created successfully."
        ),
        "active_model": "system-utility"
    }