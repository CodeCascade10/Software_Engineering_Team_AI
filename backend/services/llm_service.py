from groq import Groq

from config.settings import settings


def groq_llm():

    return Groq(
        api_key=settings.GROQ_API_KEY
    )