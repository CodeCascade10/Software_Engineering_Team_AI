from graph.state import GraphState

from tools.file_tools import append_log

from tools.terminal_tools import (
    run_terminal_command
)


def terminal_agent(state: GraphState):

    append_log(
        "[Terminal Agent] Executing terminal operations..."
    )

    commands = [
        "mkdir -p generated_projects/runtime_logs",
        "touch generated_projects/runtime_logs/server.log"
    ]

    outputs = []

    for command in commands:

        result = run_terminal_command(command)

        outputs.append({
            "command": command,
            "success": result["success"],
            "stdout": result["stdout"],
            "stderr": result["stderr"]
        })

        append_log(
            f"[Terminal Agent] Executed: {command}"
        )

    append_log(
        "[Terminal Agent] Terminal operations completed."
    )

    return {
        "terminal_output": str(outputs)
    }