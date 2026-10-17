import json


def plan_data(stack):
    backend_file = "server.js" if stack == "MERN" else "main.py"
    return {
        "goals": ["Serve an unauthenticated health endpoint"],
        "architecture_decisions": ["Use the selected backend stack"],
        "api_contract": [{
            "method": "GET", "path": "/health", "request_schema": {},
            "response_schema": {"ok": "boolean"}, "auth": False,
            "error_responses": {}, "owner_tasks": ["T1"],
        }],
        "security_constraints": ["Read configuration from environment variables"],
        "selected_stack": stack,
        "tasks": [
            {"id":"T1","owner":"backend","deliverable":[backend_file],"dependencies":[],"acceptance_criteria":[f"{backend_file} exists"]},
            {"id":"T2","owner":"frontend","deliverable":["App.jsx"],"dependencies":["T1"],"acceptance_criteria":["App.jsx exists"]},
        ],
    }


def backend_text(stack):
    if stack == "MERN":
        files = [
            ("server.js", "const express=require('express'); const app=express(); app.get('/health',(req,res)=>res.json({ok:true})); app.listen(process.env.PORT||3000);"),
            ("routes/auth.js", "module.exports = {};"),
            ("models/User.js", "module.exports = {};"),
            ("package.json", json.dumps({"name":"api","scripts":{"start":"node server.js"},"dependencies":{"express":"^4"}})),
            (".env.example", "MONGO_URI="),
        ]
    else:
        files = [
            ("main.py", "from fastapi import FastAPI\napp=FastAPI()\n@app.get('/health')\ndef health(): return {'ok': True}"),
            ("routes/auth.py", "router = None"),
            ("database.py", "db = None"),
            ("models.py", "class User: pass"),
            ("requirements.txt", "fastapi>=0.100\nuvicorn>=0.20"),
            (".env.example", "MONGO_URI="),
        ]
    fence = chr(96) * 3
    return "\n".join(f"FILE: {name}\n{fence}text\n{content}\n{fence}" for name, content in files)


def frontend_text():
    files = [
        ("index.html", '<div id="root"></div><script type="module" src="/src/main.jsx"></script>'),
        ("App.jsx", "export default function App(){return null}"),
        ("src/main.jsx", "import App from '../App.jsx';"),
        ("src/services/api.js", "api.get('/health');"),
        ("src/pages/Home.jsx", "export default function Home(){return null}"),
        ("package.json", json.dumps({"name":"web","scripts":{"dev":"vite","build":"vite build"},"dependencies":{"react":"^19","react-dom":"^19","vite":"^8"}})),
    ]
    fence = chr(96) * 3
    return "\n".join(f"FILE: {name}\n{fence}text\n{content}\n{fence}" for name, content in files)


def review_text(stack, verdict="PASS", findings=None):
    plan = plan_data(stack)
    return json.dumps({
        "verdict": verdict,
        "findings": findings or [],
        "summary": "Reviewed files and validation evidence.",
        "verified_acceptance_criteria": [
            {"task_id": task["id"], "criterion": criterion, "verified": True, "notes": "Required deliverable is present."}
            for task in plan["tasks"] for criterion in task["acceptance_criteria"]
        ],
    })
