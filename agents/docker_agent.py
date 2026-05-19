from graph.state import GraphState

from tools.file_tools import (
    append_log,
    save_docker_files
)


def docker_agent(state: GraphState):

    append_log(
        "[Docker Agent] Generating Docker configuration..."
    )

    save_docker_files()

    append_log(
        "[Docker Agent] Docker files generated successfully."
    )

    return {
        "docker_status": (
            "Docker configuration generated successfully."
        )
    }