import json

import pytest

from agents.manifests import BACKEND_MANIFESTS, FRONTEND_MANIFEST, validate_manifest


def backend_files(stack):
    if stack == "FastAPI":
        return [
            {"file_name": "main.py", "content": "from fastapi import FastAPI\napp = FastAPI()"},
            {"file_name": "routes/auth.py", "content": "router = None"},
            {"file_name": "database.py", "content": "db = None"},
            {"file_name": "models.py", "content": "class User: pass"},
            {"file_name": "requirements.txt", "content": "fastapi>=0.100.0\nmotor>=3.0"},
            {"file_name": ".env.example", "content": "MONGO_URI="},
        ]
    return [
        {"file_name": "server.js", "content": "const express = require('express');"},
        {"file_name": "routes/auth.js", "content": "module.exports = {};"},
        {"file_name": "models/User.js", "content": "module.exports = {};"},
        {"file_name": "package.json", "content": json.dumps({"name": "api", "scripts": {"start": "node server.js"}, "dependencies": {"express": "^4"}})},
        {"file_name": ".env.example", "content": "MONGO_URI="},
    ]


def frontend_files():
    return [
        {"file_name": "index.html", "content": '<div id="root"></div><script type="module" src="/src/main.jsx"></script>'},
        {"file_name": "App.jsx", "content": "export default function App() { return null; }"},
        {"file_name": "src/main.jsx", "content": "import App from '../App.jsx';"},
        {"file_name": "src/services/api.js", "content": "export const api = {};"},
        {"file_name": "src/pages/Home.jsx", "content": "export default function Home() { return null; }"},
        {"file_name": "package.json", "content": json.dumps({"name": "web", "scripts": {"dev": "vite", "build": "vite build"}, "dependencies": {"react": "^19", "react-dom": "^19", "vite": "^8"}})},
    ]


@pytest.mark.parametrize("stack", ["FastAPI", "MERN"])
def test_backend_stack_manifest_passes_and_requires_every_file(stack):
    files = backend_files(stack)
    assert validate_manifest(files, stack).passed
    for missing in BACKEND_MANIFESTS[stack]:
        assert not validate_manifest([item for item in files if item["file_name"] != missing], stack).passed, missing
    for empty in BACKEND_MANIFESTS[stack]:
        for content in ("", "   "):
            emptied = [{**item, "content": content} if item["file_name"] == empty else item for item in files]
            result = validate_manifest(emptied, stack)
            assert not result.passed, (empty, repr(content))
            assert any(check.details.get("file") == empty for check in result.checks if not check.passed)


def test_frontend_manifest_requires_all_files_and_checks_entrypoints():
    assert set(FRONTEND_MANIFEST) == {
        "index.html", "App.jsx", "src/main.jsx", "src/services/api.js", "src/pages/Home.jsx", "package.json",
    }
    files = frontend_files()
    assert validate_manifest(files, "FastAPI", agent="frontend").passed
    for missing in FRONTEND_MANIFEST:
        result = validate_manifest([item for item in files if item["file_name"] != missing], "FastAPI", agent="frontend")
        assert not result.passed, missing
        assert any(check.details.get("file") == missing for check in result.checks if not check.passed)
    for empty in FRONTEND_MANIFEST:
        for content in ("", "   "):
            bad = [{**item, "content": content} if item["file_name"] == empty else item for item in files]
            result = validate_manifest(bad, "FastAPI", agent="frontend")
            assert not result.passed, (empty, repr(content))
            assert any(check.details.get("file") == empty for check in result.checks if not check.passed)


def test_rejects_invalid_package_and_requirements_and_python_syntax():
    files = backend_files("MERN")
    files = [{**item, "content": "{"} if item["file_name"] == "package.json" else item for item in files]
    assert not validate_manifest(files, "MERN").passed
    fastapi = backend_files("FastAPI")
    fastapi = [{**item, "content": "not a valid requirement !!!"} if item["file_name"] == "requirements.txt" else item for item in fastapi]
    assert not validate_manifest(fastapi, "FastAPI").passed
    fastapi = [{**item, "content": "def broken(:"} if item["file_name"] == "main.py" else item for item in fastapi]
    assert not validate_manifest(fastapi, "FastAPI").passed
