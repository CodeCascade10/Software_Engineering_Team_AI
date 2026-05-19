from typing import TypedDict, List


class GraphState(TypedDict):
    user_prompt: str
    tasks: List[str]

    backend_code: str
    frontend_code: str
    database_schema: str

    review_feedback: str
    test_code: str
    documentation: str

    current_agent: str
    review_feedback: str
    execution_output: str
    test_results: str
    retry_count: int
    terminal_output: str
    frontend_code: str
    backend_summary: str
    readme_content: str
    github_status: str
    cicd_status: str
    deployment_status: str
    