import re

from langchain_groq import ChatGroq

from graph.state import GraphState
from config import GROQ_API_KEY

from tools.file_tools import save_file
from tools.file_tools import append_log


llm = ChatGroq(
    groq_api_key=GROQ_API_KEY,
    model_name="llama-3.3-70b-versatile"
)


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

    append_log("[Backend Agent] Generating multi-file backend project...")

    tasks = "\n".join(state["tasks"])

    prompt = f"""
You are a senior FastAPI backend architect.

Based on the following project tasks:

{tasks}

Generate a production-ready FastAPI backend.

REQUIREMENTS:
- JWT authentication
- modular architecture
- proper imports
- scalable structure
- proper comments
- clean code
- error handling

Generate these files:

1. main.py
2. auth.py
3. database.py
4. models.py
5. routes.py
6. requirements.txt

IMPORTANT:

Return response EXACTLY like this:

FILE: main.py
```python
# code here