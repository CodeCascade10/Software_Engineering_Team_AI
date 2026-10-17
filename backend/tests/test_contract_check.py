import pytest

from agents.contract_check import check_api_contract


@pytest.mark.parametrize("stack,backend", [
    ("FastAPI", [{
        "file_name": "main.py",
        "content": "from fastapi import FastAPI\napp=FastAPI()\n@app.get('/health')\ndef health(): return {}",
    }]),
    ("MERN", [{
        "file_name": "server.js",
        "content": "app.get('/health', handler);",
    }]),
])
def test_matching_backend_and_frontend_contract_pass(stack, backend):
    contract = [{"method": "GET", "path": "/health"}]
    frontend = [{"file_name": "src/services/api.js", "content": "api.get('/health')"}]
    result = check_api_contract(contract, backend, frontend, stack)
    assert result.passed
    assert any(check.name == "frontend_contract:GET:/health" and check.passed for check in result.checks)


@pytest.mark.parametrize("stack,backend", [
    ("FastAPI", [{"file_name":"main.py","content":"from fastapi import FastAPI\napp=FastAPI()\n@app.get('/health')\ndef health(): return {}\n@app.get('/extra')\ndef extra(): return {}"}]),
    ("MERN", [{"file_name":"server.js","content":"app.get('/health', handler); router.get('/extra', handler);"}]),
])
def test_backend_route_absent_from_contract_is_detected(stack, backend):
    result = check_api_contract([{"method":"GET","path":"/health"}], backend, [], stack)
    assert any(check.name == "backend_extra:GET:/extra" and not check.passed for check in result.checks)


@pytest.mark.parametrize("stack,backend", [
    ("FastAPI", [{"file_name":"main.py","content":"from fastapi import FastAPI\napp=FastAPI()"}]),
    ("MERN", [{"file_name":"server.js","content":"const app = require('express')();"}]),
])
def test_missing_contract_endpoint_is_detected_for_each_stack(stack, backend):
    result = check_api_contract([{"method":"GET","path":"/health"}], backend, [], stack)
    assert any(check.name == "contract_backend:GET:/health" and not check.passed for check in result.checks)


@pytest.mark.parametrize("stack,backend", [
    ("FastAPI", [{"file_name":"main.py","content":"from fastapi import FastAPI\napp=FastAPI()\n@app.get('/health')\ndef health(): return {}"}]),
    ("MERN", [{"file_name":"server.js","content":"app.get('/health', handler);"}]),
])
def test_frontend_wrong_method_is_detected_for_each_stack(stack, backend):
    result = check_api_contract(
        [{"method":"GET","path":"/health"}], backend,
        [{"file_name":"src/api.js","content":"api.post('/health')"}], stack,
    )
    assert any(check.name == "frontend_method:POST:/health" and not check.passed for check in result.checks)


def test_fastapi_router_prefixes_resolve_across_imported_modules():
    backend = [
        {"file_name":"main.py","content":"from fastapi import FastAPI\nfrom routes.items import router as items_router\napp=FastAPI()\napp.include_router(items_router, prefix='/api')"},
        {"file_name":"routes/items.py","content":"from fastapi import APIRouter\nrouter=APIRouter(prefix='/items')\n@router.get('/{item_id}')\ndef get(item_id): return {}"},
    ]
    result = check_api_contract(
        [{"method":"GET","path":"/api/items/{id}"}], backend, [], "FastAPI",
    )
    assert result.passed


def test_express_ignores_comment_routes_and_resolves_mount_prefixes():
    backend = [
        {"file_name":"server.js","content":"const itemsRouter=require('./routes/items'); app.use('/api', itemsRouter); // app.get('/ghost');\nconst note=\"app.get('/string-ghost')\";"},
        {"file_name":"routes/items.js","content":"const router=require('express').Router(); router.get('/items/:item_id', handler);"},
    ]
    result = check_api_contract(
        [{"method":"GET","path":"/api/items/{id}"}], backend, [], "MERN",
    )
    assert result.passed
    assert not any("ghost" in check.name for check in result.checks)


def test_frontend_template_path_and_axios_instance_base_url_resolve():
    frontend = [{
        "file_name":"src/services/api.js",
        "content":"const API_BASE='/api'; const api=axios.create({baseURL: API_BASE}); api.get(`/items/${itemId}`);",
    }]
    result = check_api_contract(
        [{"method":"GET","path":"/api/items/{id}"}],
        [{"file_name":"server.js","content":"app.get('/api/items/:id', handler);"}],
        frontend, "MERN",
    )
    assert result.passed


def test_dynamic_frontend_url_is_reported_as_nonmandatory_warning():
    result = check_api_contract(
        [{"method":"GET","path":"/health"}],
        [{"file_name":"server.js","content":"app.get('/health', handler);"}],
        [{"file_name":"src/services/api.js","content":"api.get(url);"}],
        "MERN",
    )
    warning = next(check for check in result.checks if check.name.startswith("frontend_dynamic:"))
    assert warning.mandatory is False
    assert warning.severity == "low"
    assert warning.details["file"] == "src/services/api.js"
