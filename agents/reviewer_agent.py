from langchain_groq import ChatGroq

from graph.state import GraphState
from config import GROQ_API_KEY

from tools.file_tools import append_log


llm = ChatGroq(
    groq_api_key=GROQ_API_KEY,
    model_name="llama-3.3-70b-versatile"
)


def reviewer_agent(state: GraphState):

    append_log("[Reviewer Agent] Reviewing generated backend code...")

    backend_code = state["backend_code"]

    prompt = f"""
    You are a senior software code reviewer.

    Review the following FastAPI backend code.

    CHECK FOR:
    - security vulnerabilities
    - JWT authentication mistakes
    - scalability issues
    - bad coding practices
    - missing imports
    - invalid FastAPI patterns
    - code readability
    - architecture quality

    PROVIDE:
    - strengths
    - weaknesses
    - improvements
    - optimization suggestions

    BACKEND CODE:
    {backend_code}
    """

    response = llm.invoke(prompt)

    append_log("[Reviewer Agent] Code review completed.")

    return {
        "review_feedback": response.content,
        "current_agent": "reviewer_agent"
    }