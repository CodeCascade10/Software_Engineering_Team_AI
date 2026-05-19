# from langgraph.graph import StateGraph, END

# from graph.state import GraphState

# from agents.planner_agent import planner_agent


# def build_graph():

#     workflow = StateGraph(GraphState)

#     # Add nodes
#     workflow.add_node("planner", planner_agent)

#     # Entry point
#     workflow.set_entry_point("planner")

#     # End flow
#     workflow.add_edge("planner", END)

#     return workflow.compile()
from langgraph.graph import StateGraph, END

from graph.state import GraphState

from agents.planner_agent import planner_agent
from agents.backend_agent import backend_agent
from agents.reviewer_agent import reviewer_agent
from agents.fix_agent import fix_agent
from agents.debug_agent import debug_agent
from agents.test_agent import test_agent
from langgraph.graph import StateGraph, END
from agents.terminal_agent import terminal_agent
from agents.docker_agent import docker_agent
from agents.readme_agent import readme_agent
from agents.github_agent import github_agent
from agents.frontend_agent import frontend_agent
from agents.cicd_agent import cicd_agent
from agents.deploy_agent import deploy_agent




def should_retry(state):

    test_results = state.get("test_results", "")

    retry_count = state.get("retry_count", 0)

    if retry_count >= 2:

        return END

    if "Connection refused" in test_results:
        return "fixer"

    return END


def build_graph():

    workflow = StateGraph(GraphState)

    workflow.add_node(
        "planner",
        planner_agent
    )

    workflow.add_node(
        "backend",
        backend_agent
    )

    workflow.add_node(
        "reviewer",
        reviewer_agent
    )

    workflow.add_node(
        "fixer",
        fix_agent
    )

    workflow.set_entry_point(
        "planner"
    )

    workflow.add_edge(
        "planner",
        "backend"
    )

    workflow.add_edge(
        "backend",
        "reviewer"
    )

    workflow.add_edge(
        "reviewer",
        "fixer"
    )

    workflow.add_edge(
        "fixer",
        END
    )

    return workflow.compile()