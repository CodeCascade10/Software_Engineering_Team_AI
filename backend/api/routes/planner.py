import os
import re
from fastapi import APIRouter
from pydantic import BaseModel
from services.llm_service import groq_llm

router = APIRouter(
    prefix="/planner",
    tags=["Planner & Generators"]
)

class PlanRequest(BaseModel):
    idea: str

class BackendRequest(BaseModel):
    description: str

class FrontendRequest(BaseModel):
    description: str


@router.post("/plan-project")
async def plan_project_route(payload: PlanRequest):
    llm = groq_llm()
    
    prompt = f"""
You are an expert senior software architect and project planner.

Your job is to break down the user's software idea into a structured, step-by-step development roadmap and flow-like answer.
Create an architectural flow plan for the following project idea:
"{payload.idea}"

The response must be detailed, visual, and follow this exact layout:
# Architectural Flow & Development Roadmap: {payload.idea}

## 1. System Data Flow
Describe how data moves step-by-step through the application using flow representations:
User ➔ React Frontend ➔ API endpoints ➔ FastAPI backend handlers ➔ Database queries ➔ MongoDB / PostgreSQL ➔ Response flows back to User.

## 2. Database Models & Schema flow
Detail the entities, their properties, and relationship flow (Entity A ──> Entity B). Use Markdown tables and code blocks.

## 3. Backend API Service Flow
Provide the HTTP methods, paths, request payloads, response payloads, and step-by-step service execution flow:
- **POST** `/api/v1/auth/login` (Auth validation ➔ JWT Generation ➔ Return Token)
- **GET** `/api/v1/data` (Token verify ➔ Fetch from DB ➔ Serialize ➔ Return Data)
- Include other relevant API endpoints.

## 4. Frontend Component & Navigation Flow
Outline the pages, component hierarchy, state flow, and page transition paths:
Login Page ➔ Auth Guard ➔ Dashboard Page (Sidebar component ➔ Main content panel).

## 5. Security & Verification Flow
Outline step-by-step security checks and integration verification flow.

Make it extremely comprehensive, premium, and flow-oriented. Return the response as clean Markdown.
"""
    response = llm.invoke(prompt)
    plan_content = response.content

    # Extract short checklist tasks for the frontend UI
    tasks_prompt = f"""
Based on the following architecture plan:
"{plan_content}"

Extract a clean list of 4-6 bullet-point development tasks (1-2 sentences each). Return ONLY the bullet points, no introductory or concluding text. Do not include markdown headers.
"""
    tasks_response = llm.invoke(tasks_prompt)
    tasks = [
        line.strip("- *• ").strip()
        for line in tasks_response.content.split("\n")
        if line.strip()
    ]
    
    # Save the architecture.md file locally
    os.makedirs("generated_projects/generated_backend", exist_ok=True)
    with open("generated_projects/generated_backend/architecture.md", "w", encoding="utf-8") as f:
        f.write(plan_content)

    return {
        "success": True,
        "plan": plan_content,
        "tasks": tasks
    }


@router.post("/generate-backend")
async def generate_backend_route(payload: BackendRequest):
    llm = groq_llm()
    prompt = f"""
You are a senior FastAPI backend architect.
Based on the following user request:
"{payload.description}"

Generate a complete, production-ready FastAPI backend.
Include JWT authentication, database models, error handling, routes, and configure it nicely.

Return the response containing these files:
1. main.py
2. auth.py
3. database.py
4. models.py
5. routes.py
6. requirements.txt

IMPORTANT: Format each file EXACTLY like this:

FILE: main.py
```python
# code here
```

FILE: auth.py
```python
# code here
```

FILE: database.py
```python
# code here
```

FILE: models.py
```python
# code here
```

FILE: routes.py
```python
# code here
```

FILE: requirements.txt
```txt
# requirements list
```
"""
    response = llm.invoke(prompt)
    content = response.content
    
    # Extract files
    pattern = r"FILE:\s*(.*?)\n```(?:python|txt)?\n(.*?)```"
    matches = re.findall(pattern, content, re.DOTALL)
    
    files_list = []
    
    # Save directory
    os.makedirs("generated_projects/generated_backend", exist_ok=True)
    
    for filename, code in matches:
        filename = filename.strip()
        code_clean = code.strip()
        
        # Save to disk
        filepath = f"generated_projects/generated_backend/{filename}"
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(code_clean)
            
        files_list.append({
            "file_name": filename,
            "content": code_clean
        })
        
    return {
        "success": True,
        "files": files_list
    }


@router.post("/generate-frontend")
async def generate_frontend_route(payload: FrontendRequest):
    llm = groq_llm()
    prompt = f"""
You are a senior React frontend architect.
Based on the following user request:
"{payload.description}"

Generate a beautiful, responsive React frontend.
Include responsive layout, navbar, components, pages, API service, package.json, and vite.config.js.

Return the response containing these files:
1. App.jsx
2. components/Navbar.jsx
3. pages/Home.jsx
4. pages/Login.jsx
5. services/api.js
6. package.json
7. vite.config.js

IMPORTANT: Format each file EXACTLY like this:

FILE: App.jsx
```jsx
# code here
```

FILE: components/Navbar.jsx
```jsx
# code here
```

FILE: pages/Home.jsx
```jsx
# code here
```

FILE: pages/Login.jsx
```jsx
# code here
```

FILE: services/api.js
```javascript
# code here
```

FILE: package.json
```json
# code here
```

FILE: vite.config.js
```javascript
# code here
```
"""
    response = llm.invoke(prompt)
    content = response.content
    
    # Extract files
    pattern = r"FILE:\s*(.*?)\n```(?:jsx|javascript|json)?\n(.*?)```"
    matches = re.findall(pattern, content, re.DOTALL)
    
    files_list = []
    
    # Save directory
    os.makedirs("generated_projects/generated_frontend", exist_ok=True)
    
    for filename, code in matches:
        filename = filename.strip()
        code_clean = code.strip()
        
        # Save to disk
        filepath = f"generated_projects/generated_frontend/{filename}"
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(code_clean)
            
        files_list.append({
            "file_name": filename,
            "content": code_clean
        })
        
    return {
        "success": True,
        "files": files_list
    }
