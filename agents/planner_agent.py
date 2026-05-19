from graph.state import GraphState

from llm_providers import groq_llm

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

    response = llm.invoke(prompt)

    tasks = [
        task.strip()
        for task in response.content.split("\n")
        if task.strip()
    ]

    append_log(
        "[Planner Agent] Task planning completed."
    )

    return {
        "tasks": tasks,
        "active_model": "groq-llama-3.3"
    }