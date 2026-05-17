from langchain_groq import ChatGroq
from graph.state import GraphState
from config import GROQ_API_KEY
from tools.file_tools import append_log

llm = ChatGroq(
    groq_api_key=GROQ_API_KEY,
    model_name="llama-3.3-70b-versatile"
)


from tools.file_tools import append_log


def planner_agent(state: GraphState):

    append_log("[Planner Agent] Planning project tasks...")

    user_prompt = state["user_prompt"]

    prompt = f"""
    You are a senior software architect and project planner.

    Your job is to break down software projects into
    structured development tasks.

    USER PROJECT REQUEST:
    {user_prompt}

    Create:
    - clear tasks
    - development phases
    - backend requirements
    - frontend requirements
    - security requirements
    - deployment considerations

    Return ONLY a clean bullet-point task list.
    """

    response = llm.invoke(prompt)

    tasks = [
        task.strip()
        for task in response.content.split("\n")
        if task.strip()
    ]

    append_log("[Planner Agent] Task planning completed.")

    return {
        "tasks": tasks,
        "current_agent": "planner_agent"
    }