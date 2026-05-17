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
    code = code.replace("```", "")

    return code.strip()


def fix_agent(state: GraphState):

    append_log("[Fix Agent] Improving backend code...")

    backend_code = state["backend_code"]
    review_feedback = state["review_feedback"]

    prompt = f"""
    You are a senior FastAPI engineer.

    Improve the backend code using the review feedback.

    REVIEW FEEDBACK:
    {review_feedback}

    ORIGINAL BACKEND CODE:
    {backend_code}

    REQUIREMENTS:
    - improve scalability
    - improve security
    - fix bad practices
    - optimize architecture
    - improve JWT handling
    - improve readability
    - ensure valid FastAPI code

    Return ONLY valid Python code.
    """

    response = llm.invoke(prompt)

    improved_code = clean_code(response.content)

    save_file(
        "generated_projects/generated_backend/improved_main.py",
        improved_code
    )

    append_log("[Fix Agent] Backend improvements completed.")

    return {
        "backend_code": improved_code,
        "current_agent": "fix_agent"
    }