from graph.state import GraphState

from services.llm_service import groq_llm

from tools.terminal_tools import (
    install_requirements,
    run_fastapi_server
)

from tools.file_tools import (
    save_file,
    append_log
)


llm = groq_llm()


def clean_code(code: str):

    code = code.replace("```python", "")
    code = code.replace("```", "")

    return code.strip()


def debug_agent(state: GraphState):

    append_log(
        "[Debug Agent] Installing project dependencies..."
    )

    requirements_result = install_requirements(
        "generated_projects/generated_backend/requirements.txt"
    )

    if requirements_result["success"]:

        append_log(
            "[Debug Agent] Dependencies installed successfully."
        )

    else:

        append_log(
            "[Debug Agent] Dependency installation failed."
        )

        return {
            "execution_output": requirements_result["stderr"],
            "active_model": "system-utility"
        }

    append_log(
        "[Debug Agent] Launching FastAPI server..."
    )

    execution_result = run_fastapi_server()

    if execution_result["success"]:

        append_log(
            "[Debug Agent] Backend executed successfully."
        )

        return {
            "execution_output": execution_result["stdout"],
            "active_model": "system-utility"
        }

    append_log(
        "[Debug Agent] Errors detected. Attempting automatic fixes..."
    )

    backend_code = state.get(
        "backend_code",
        ""
    )

    if not backend_code:

        append_log(
            "[Debug Agent] No backend code found."
        )

        return {
            "execution_output": (
                "No backend code available for debugging."
            ),
            "active_model": "system-utility"
        }

    prompt = (
        f"You are an expert Python debugger.\n\n"

        f"The following FastAPI backend code failed during execution.\n\n"

        f"ERROR:\n"
        f"{execution_result['stderr']}\n\n"

        f"CODE:\n"
        f"{backend_code}\n\n"

        f"TASK:\n"
        f"- fix runtime issues\n"
        f"- fix syntax errors\n"
        f"- fix import issues\n"
        f"- fix FastAPI issues\n"
        f"- ensure executable code\n"
        f"- improve stability\n\n"

        f"Return ONLY valid Python code.\n"
    )

    response = llm.invoke(prompt)

    fixed_code = clean_code(
        response.content
    )

    save_file(
        "generated_projects/generated_backend/debugged_main.py",
        fixed_code
    )

    append_log(
        "[Debug Agent] Debugging completed and fixed code saved."
    )

    return {
        "backend_code": fixed_code,
        "execution_output": execution_result["stderr"],
        "active_model": "groq-llama-3.3"
    }