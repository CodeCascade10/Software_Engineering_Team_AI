from graph.state import GraphState

from tools.file_tools import append_log

from tools.terminal_tools import (
    test_api_endpoint
)


MAX_RETRIES = 2


def test_agent(state: GraphState):

    append_log(
        "[Test Agent] Testing API endpoints..."
    )

    result = test_api_endpoint()

    retry_count = state.get(
        "retry_count",
        0
    )

    if result["success"]:

        append_log(
            "[Test Agent] API test passed successfully."
        )

        return {
            "test_results": result["response"],
            "retry_count": retry_count
        }

    append_log(
        f"[Test Agent] API test failed. "
        f"Retry count: {retry_count}"
    )

    return {
        "test_results": result["response"],
        "retry_count": retry_count + 1
    }