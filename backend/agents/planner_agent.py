from graph.state import GraphState

from services.llm_service import groq_llm
from services.workflow_logger import save_workflow_log

from tools.file_tools import append_log


llm = groq_llm()


def planner_agent(state: GraphState):

    append_log(
        "[Planner Agent] Planning project tasks..."
    )

    user_prompt = state.get(
        "user_prompt",
        ""
    )

    project_id = state.get(
        "project_id"
    )

    if not user_prompt:

        append_log(
            "[Planner Agent] No user prompt found."
        )

        return {
            "tasks": [],
            "active_model": "system-utility"
        }

    prompt = (
        f"You are a senior software architect and project planner.\n\n"

        f"Your job is to break down software projects into "
        f"structured development tasks.\n\n"

        f"USER PROJECT REQUEST:\n"
        f"{user_prompt}\n\n"

        f"Create:\n"
        f"- clear tasks\n"
        f"- development phases\n"
        f"- backend requirements\n"
        f"- frontend requirements\n"
        f"- security requirements\n"
        f"- deployment considerations\n\n"

        f"Return ONLY a clean bullet-point task list.\n"
    )

    print("PLANNER START")

    save_workflow_log(
        project_id,
        "planner",
        "Planning started"
    )

    response = llm.invoke(prompt)

    print("PLANNER END")

    save_workflow_log(
        project_id,
        "planner",
        "Planning completed",
        "completed"
    )

    tasks = [
        task.strip()
        for task in response.content.split("\n")
        if task.strip()
    ]

    print(tasks)

    append_log(
        "[Planner Agent] Task planning completed."
    )

    return {
        "tasks": tasks,
        "active_model": "groq-llama-3.3"
    }