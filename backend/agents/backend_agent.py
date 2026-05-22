import re

from graph.state import GraphState

from services.llm_service import groq_llm
from services.workflow_logger import save_workflow_log

from tools.file_tools import (
    save_file,
    append_log
)


llm = groq_llm()


def clean_code(code: str):

    code = code.replace("```python", "")
    code = code.replace("```txt", "")
    code = code.replace("```", "")

    return code.strip()


def extract_files(response_text: str):

    pattern = r"FILE:\s*(.*?)\n```(?:python|txt)?\n(.*?)```"

    matches = re.findall(
        pattern,
        response_text,
        re.DOTALL
    )

    return matches


def backend_agent(state: GraphState):

    append_log(
        "[Backend Agent] Generating multi-file backend project..."
    )

    tasks = "\n".join(
        state.get("tasks", [])
    )

    project_id = state.get(
        "project_id"
    )

    if not tasks:

        append_log(
            "[Backend Agent] No tasks found."
        )

        return {
            "backend_code": "",
            "backend_summary": "",
            "active_model": "system-utility"
        }

    prompt = (
        f"You are a senior FastAPI backend architect.\n\n"

        f"Based on the following project tasks:\n\n"

        f"{tasks}\n\n"

        f"Generate a production-ready FastAPI backend.\n\n"

        f"REQUIREMENTS:\n"
        f"- JWT authentication\n"
        f"- modular architecture\n"
        f"- proper imports\n"
        f"- scalable structure\n"
        f"- proper comments\n"
        f"- clean code\n"
        f"- error handling\n\n"

        f"Generate these files:\n\n"

        f"1. main.py\n"
        f"2. auth.py\n"
        f"3. database.py\n"
        f"4. models.py\n"
        f"5. routes.py\n"
        f"6. requirements.txt\n\n"

        f"IMPORTANT:\n\n"

        f"Return response EXACTLY like this:\n\n"

        f"FILE: main.py\n"
        f"```python\n"
        f"# code here\n"
        f"```\n\n"

        f"FILE: auth.py\n"
        f"```python\n"
        f"# code here\n"
        f"```\n\n"

        f"FILE: database.py\n"
        f"```python\n"
        f"# code here\n"
        f"```\n\n"

        f"FILE: models.py\n"
        f"```python\n"
        f"# code here\n"
        f"```\n\n"

        f"FILE: routes.py\n"
        f"```python\n"
        f"# code here\n"
        f"```\n\n"

        f"FILE: requirements.txt\n"
        f"```txt\n"
        f"fastapi\n"
        f"uvicorn\n"
        f"sqlalchemy\n"
        f"python-jose\n"
        f"passlib\n"
        f"bcrypt\n"
        f"```\n"
    )

    print("BACKEND START")

    save_workflow_log(
        project_id,
        "backend",
        "Backend generation started"
    )

    response = llm.invoke(prompt)

    print("BACKEND END")

    save_workflow_log(
        project_id,
        "backend",
        "Backend generation completed",
        "completed"
    )

    generated_code = response.content

    files = extract_files(
        generated_code
    )

    for filename, code in files:

        cleaned_code = clean_code(code)

        save_file(
            f"generated_projects/generated_backend/{filename}",
            cleaned_code
        )

        append_log(
            f"[Backend Agent] Created file: {filename}"
        )

    append_log(
        "[Backend Agent] Backend generation completed."
    )

    return {
        "backend_code": generated_code,
        "backend_summary": tasks,
        "active_model": "groq-llama-3.3"
    }

async def run_backend_agent(project_id: str):

    state = {
        "tasks": [
            "Build authentication system",
            "Create FastAPI backend",
            "Create JWT auth",
            "Build scalable routes"
        ],
        "project_id": project_id
    }

    backend_agent(state)