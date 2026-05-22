from agents.planner_agent import run_planner_agent
from agents.backend_agent import run_backend_agent
from agents.frontend_agent import run_frontend_agent
from agents.reviewer_agent import run_reviewer_agent
from agents.executor_agent import run_executor_agent
from agents.devops_agent import run_devops_agent
import asyncio

workflow_status = {}


async def run_full_pipeline(project_id: str):
    

    await asyncio.sleep(3)

    workflow_status[project_id] = {

        "status": "running",

        "current_agent": "Planner Agent"

    }

    await run_planner_agent(project_id)

    
    await asyncio.sleep(3)
    workflow_status[project_id][
        "current_agent"
    ] = "Backend Agent"

    await run_backend_agent(project_id)


    await asyncio.sleep(3)

    workflow_status[project_id][
        "current_agent"
    ] = "Frontend Agent"

    await run_frontend_agent(project_id)


    await asyncio.sleep(3)

    workflow_status[project_id][
        "current_agent"
    ] = "Reviewer Agent"

    await run_reviewer_agent(project_id)


    
    await asyncio.sleep(3)
    workflow_status[project_id][
        "current_agent"
    ] = "Executor Agent"

    await run_executor_agent(project_id)

   
    await asyncio.sleep(3)
    workflow_status[project_id][
        "current_agent"
    ] = "DevOps Agent"

    await run_devops_agent(project_id)


    await asyncio.sleep(3)

    workflow_status[project_id] = {

        "status": "completed",

        "current_agent": "Completed"

    }

    return workflow_status[project_id]