from langchain_groq import ChatGroq

from graph.state import GraphState
from config import GROQ_API_KEY

from tools.terminal_tools import run_python_file
from tools.terminal_tools import install_requirements

from tools.file_tools import save_file
from tools.file_tools import append_log
from tools.terminal_tools import run_fastapi_server


llm = ChatGroq(
    groq_api_key=GROQ_API_KEY,
    model_name="llama-3.3-70b-versatile"
)


def clean_code(code: str):

    code = code.replace("```python", "")
    code = code.replace("```", "")

    return code.strip()


def debug_agent(state: GraphState):

    append_log("[Debug Agent] Installing project dependencies...")

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
            "current_agent": "debug_agent"
        }

    

    append_log("[Debug Agent] Launching FastAPI server...")

    execution_result = run_fastapi_server()
    if execution_result["success"]:

        append_log(
            "[Debug Agent] Backend executed successfully."
        )

        return {
            "execution_output": execution_result["stdout"],
            "current_agent": "debug_agent"
        }

    append_log(
        "[Debug Agent] Errors detected. Attempting automatic fixes..."
    )

    backend_code = state["backend_code"]

    prompt = f"""
You are an expert Python debugger.

The following FastAPI backend code failed during execution.

ERROR:
{execution_result["stderr"]}

CODE:
{backend_code}

TASK:
- fix runtime issues
- fix syntax errors
- fix import issues
- fix FastAPI issues
- ensure executable code
- improve stability

Return ONLY valid Python code.
"""

    response = llm.invoke(prompt)

    fixed_code = clean_code(response.content)

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
        "current_agent": "debug_agent"
    }