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


def build_graph():

    workflow = StateGraph(GraphState)

    # Nodes
    workflow.add_node("planner", planner_agent)
    workflow.add_node("backend", backend_agent)
    workflow.add_node("reviewer", reviewer_agent)
    workflow.add_node("fixer", fix_agent)
    workflow.add_node("debugger", debug_agent)

    # Entry point
    workflow.set_entry_point("planner")

    # Flow
    workflow.add_edge("planner", "backend")
    workflow.add_edge("backend", "reviewer")
    workflow.add_edge("reviewer", "fixer")
    workflow.add_edge("fixer", "debugger")
    workflow.add_edge("debugger", END)

    return workflow.compile()