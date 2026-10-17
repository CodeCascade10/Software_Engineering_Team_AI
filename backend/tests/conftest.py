from types import SimpleNamespace

import pytest


class FakeLLM:
    """Scripted, offline model double. Items may be response strings or exceptions."""

    def __init__(self, *responses):
        self.responses = list(responses)
        self.prompts = []

    def invoke(self, prompt):
        self.prompts.append(prompt)
        if not self.responses:
            raise AssertionError("FakeLLM received an unexpected call")
        response = self.responses.pop(0)
        if isinstance(response, Exception):
            raise response
        return SimpleNamespace(content=response)


@pytest.fixture
def fake_llm():
    return FakeLLM
