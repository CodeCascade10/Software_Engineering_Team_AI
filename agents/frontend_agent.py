import re

from graph.state import GraphState

from llm_providers import groq_llm

from tools.file_tools import (
    save_file,
    append_log
)


llm = groq_llm()


def clean_code(code: str):

    code = code.replace("```jsx", "")
    code = code.replace("```javascript", "")
    code = code.replace("```json", "")
    code = code.replace("```", "")

    return code.strip()


def extract_files(response_text: str):

    pattern = (
        r"FILE:\s*(.*?)\n"
        r"```(?:jsx|javascript|json)?\n"
        r"(.*?)```"
    )

    matches = re.findall(
        pattern,
        response_text,
        re.DOTALL
    )

    return matches


def frontend_agent(state: GraphState):

    append_log(
        "[Frontend Agent] Generating React frontend..."
    )

    backend_summary = state.get(
        "backend_summary",
        ""
    )

    if not backend_summary:

        append_log(
            "[Frontend Agent] No backend summary found."
        )

        return {
            "frontend_status": (
                "No backend summary available."
            ),
            "active_model": "system-utility"
        }

    prompt = (
        f"You are a senior React frontend architect.\n\n"

        f"Generate a beautiful React frontend for the backend system.\n\n"

        f"BACKEND CONTEXT:\n"
        f"{backend_summary}\n\n"

        f"The frontend must integrate with FastAPI backend routes.\n"
        f"Use axios for backend communication.\n\n"

        f"REQUIREMENTS:\n"
        f"- React + Vite\n"
        f"- Responsive UI\n"
        f"- JWT authentication UI\n"
        f"- real API integration\n"
        f"- axios API client\n"
        f"- authentication flow\n"
        f"- login/register UI\n"
        f"- token handling\n"
        f"- protected route structure\n"
        f"- Tailwind styling\n"
        f"- Clean architecture\n\n"

        f"Generate:\n\n"

        f"1. App.jsx\n"
        f"2. components/Navbar.jsx\n"
        f"3. pages/Home.jsx\n"
        f"4. pages/Login.jsx\n"
        f"5. services/api.js\n"
        f"6. package.json\n"
        f"7. vite.config.js\n\n"

        f"IMPORTANT:\n\n"

        f"Return EXACTLY like this:\n\n"

        f"FILE: App.jsx\n"
        f"```jsx\n"
        f"// code here\n"
        f"```\n\n"

        f"FILE: components/Navbar.jsx\n"
        f"```jsx\n"
        f"// code here\n"
        f"```\n\n"

        f"FILE: pages/Home.jsx\n"
        f"```jsx\n"
        f"// code here\n"
        f"```\n\n"

        f"FILE: pages/Login.jsx\n"
        f"```jsx\n"
        f"// code here\n"
        f"```\n\n"

        f"FILE: services/api.js\n"
        f"```javascript\n"
        f"// code here\n"
        f"```\n\n"

        f"FILE: package.json\n"
        f"```json\n"
        f"{{\n"
        f'  "name": "frontend"\n'
        f"}}\n"
        f"```\n\n"

        f"FILE: vite.config.js\n"
        f"```javascript\n"
        f"// code here\n"
        f"```\n"
    )

    response = llm.invoke(prompt)

    generated_code = response.content

    files = extract_files(
        generated_code
    )

    for filename, code in files:

        cleaned_code = clean_code(code)

        save_file(
            f"generated_projects/generated_frontend/{filename}",
            cleaned_code
        )

        append_log(
            f"[Frontend Agent] Created file: {filename}"
        )

    append_log(
        "[Frontend Agent] Frontend generation completed."
    )

    return {
        "frontend_status": (
            "Frontend generated successfully."
        ),
        "active_model": "groq-llama-3.3"
    }