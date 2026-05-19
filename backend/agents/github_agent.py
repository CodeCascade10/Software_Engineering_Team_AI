from graph.state import GraphState

from tools.file_tools import append_log

from tools.terminal_tools import git_command


def github_agent(state: GraphState):

    append_log(
        "[GitHub Agent] Initializing repository..."
    )

    commands = [

        "cd generated_projects && git init",

        "cd generated_projects && git add .",

        (
            'cd generated_projects && '
            'git commit -m "AI generated full-stack project"'
        )
    ]

    outputs = []

    for command in commands:

        result = git_command(command)

        outputs.append({
            "command": command,
            "success": result["success"],
            "stdout": result["stdout"],
            "stderr": result["stderr"]
        })

        append_log(
            f"[GitHub Agent] Executed: {command}"
        )

    append_log(
        "[GitHub Agent] Repository initialized successfully."
    )

    return {
        "github_status": str(outputs),
        "active_model": "system-utility"
    }