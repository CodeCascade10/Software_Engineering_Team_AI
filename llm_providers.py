from langchain_groq import ChatGroq

from config import GROQ_API_KEY


def groq_llm():

    return ChatGroq(
        groq_api_key=GROQ_API_KEY,
        model_name="llama-3.3-70b-versatile"
    )