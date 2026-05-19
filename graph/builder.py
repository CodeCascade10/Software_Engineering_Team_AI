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

    # Nodes
    workflow.add_node("planner", planner_agent)
    workflow.add_node("backend", backend_agent)
    workflow.add_node("reviewer", reviewer_agent)
    workflow.add_node("fixer", fix_agent)
    workflow.add_node("debugger", debug_agent)
    workflow.add_node("tester", test_agent)
    workflow.add_node(
    "terminal",
    terminal_agent
)
    workflow.add_node(
    "docker",
    docker_agent
)
    workflow.add_node(
    "frontend",
    frontend_agent
)
    workflow.add_node(
    "readme",
    readme_agent
)
    workflow.add_node(
    "github",
    github_agent
)
    workflow.add_node(
    "cicd",
    cicd_agent
)
    workflow.add_node(
    "deploy",
    deploy_agent
)

    # Entry point
    workflow.set_entry_point("planner")

    # Flow
    workflow.add_edge("planner", "backend")
    workflow.add_edge("backend", "reviewer")
    workflow.add_edge("reviewer", "fixer")
    workflow.add_edge("fixer", "debugger")
    workflow.add_edge("debugger", "tester")
    workflow.add_conditional_edges(
    "tester",
    should_retry
)
    workflow.add_edge(
    "tester",
    "terminal"
)

    workflow.add_edge(
    "terminal",
    END
)
    workflow.add_edge(
    "terminal",
    "docker"
)

    workflow.add_edge(
    "docker",
    END
)
    workflow.add_edge(
    "docker",
    "frontend"
)

    workflow.add_edge(
    "frontend",
    END
)
    workflow.add_edge(
    "frontend",
    "readme"
)

    workflow.add_edge(
    "readme",
    END
)
    workflow.add_edge(
    "readme",
    "github"
)

    workflow.add_edge(
    "github",
    END
)
    workflow.add_edge(
    "github",
    "cicd"
)

    workflow.add_edge(
    "cicd",
    END
)
    workflow.add_edge(
    "cicd",
    "deploy"
)

    workflow.add_edge(
    "deploy",
    END
)

    return workflow.compile()