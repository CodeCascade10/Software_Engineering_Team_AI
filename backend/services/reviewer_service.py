from services.llm_service import groq_llm


async def review_code(code: str, language: str):

    llm = groq_llm()

    prompt = f"""
You are an expert senior software engineer.

Review the following {language} code.

Provide:
1. Bugs
2. Code quality improvements
3. Performance issues
4. Security issues
5. Best practices

Code:
{code}
"""

    response = llm.invoke(prompt)

    return {
        "success": True,
        "review": response.content
    }