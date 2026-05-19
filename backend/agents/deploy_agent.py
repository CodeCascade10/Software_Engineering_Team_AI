from graph.state import GraphState

from tools.file_tools import (
    append_log,
    save_render_config
)


def deploy_agent(state: GraphState):

    append_log(
        "[Deploy Agent] Preparing cloud deployment configuration..."
    )

    save_render_config()

    append_log(
        "[Deploy Agent] Render deployment configuration generated."
    )

    return {
        "deployment_status": (
            "Render deployment configuration created successfully."
        )
    }