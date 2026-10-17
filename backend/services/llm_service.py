from dataclasses import dataclass

from groq import Groq

from config.settings import settings


MODEL_NAME = "llama-3.3-70b-versatile"


@dataclass
class LLMResponse:
    content: str


class GroqLLM:
    """Small adapter exposing the invoke interface used by the agents."""

    def __init__(self):
        # Build the SDK client only when a request is made so importing the app
        # does not fail before configuration errors can be reported clearly.
        self._client = None

    def _get_client(self):
        if self._client is None:
            if not settings.GROQ_API_KEY:
                raise RuntimeError("GROQ_API_KEY is not configured")
            self._client = Groq(api_key=settings.GROQ_API_KEY)
        return self._client

    @property
    def chat(self):
        return self._get_client().chat

    def invoke(self, prompt: str) -> LLMResponse:
        response = self._get_client().chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
        )
        return LLMResponse(content=response.choices[0].message.content or "")


def groq_llm() -> GroqLLM:
    return GroqLLM()
