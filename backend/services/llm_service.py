from langchain_groq import ChatGroq

from config.settings import settings




def groq_llm():

    return ChatGroq(
        groq_api_key=settings.GROQ_API_KEY,
        model_name="llama-3.3-70b-versatile"
    )