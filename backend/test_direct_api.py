import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
payload = {}
try:
    print(f"Listing models from: {url[:50]}...")
    response = requests.get(url, timeout=10)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        models = response.json().get('models', [])
        with open("models.txt", "w") as f:
            for m in models:
                if 'gemini' in m['name'].lower():
                    f.write(m['name'] + "\n")
        print("Models written to models.txt")
    else:
        print(f"Response: {response.text[:500]}")
except Exception as e:
    print(f"Direct API Error: {e}")
