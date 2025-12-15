import os
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key present: {bool(api_key)}")
if api_key:
    print(f"API Key prefix: {api_key[:5]}...")

try:
    print("Initializing LLM...")
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        api_key=api_key
    )
    print("Invoking LLM...")
    response = llm.invoke("Hello, are you working?")
    print(f"Response: {response.content}")
except Exception as e:
    print(f"LLM Error: {e}")
