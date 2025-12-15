"""
Debug script to find import errors
"""
import sys
print("Python version:", sys.version)
print("=" * 60)

print("Testing imports step by step...")
print()

try:
    print("1. Importing FastAPI...")
    from fastapi import FastAPI
    print("   ✓ FastAPI imported successfully")
except Exception as e:
    print(f"   ✗ FastAPI import failed: {e}")
    sys.exit(1)

try:
    print("2. Importing os and dotenv...")
    import os
    from dotenv import load_dotenv
    load_dotenv()
    print("   ✓ os and dotenv imported successfully")
    print(f"   API Key set: {'Yes' if os.getenv('GEMINI_API_KEY') else 'No'}")
except Exception as e:
    print(f"   ✗ os/dotenv import failed: {e}")
    sys.exit(1)

try:
    print("3. Importing ChromaDB...")
    import chromadb
    print("   ✓ ChromaDB imported successfully")
except Exception as e:
    print(f"   ✗ ChromaDB import failed: {e}")
    sys.exit(1)

try:
    print("4. Importing LangChain...")
    from langchain_google_genai import ChatGoogleGenerativeAI
    print("   ✓ LangChain imported successfully")
except Exception as e:
    print(f"   ✗ LangChain import failed: {e}")
    sys.exit(1)

print()
print("=" * 60)
print("Testing service imports...")
print()

try:
    print("5. Importing diet service...")
    from services.diet import diet_service
    print("   ✓ Diet service imported successfully")
except Exception as e:
    print(f"   ✗ Diet service import failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

try:
    print("6. Importing finance service...")
    from services.finance import finance_service
    print("   ✓ Finance service imported successfully")
except Exception as e:
    print(f"   ✗ Finance service import failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

try:
    print("7. Importing emotional service...")
    from services.emotional import emotional_service
    print("   ✓ Emotional service imported successfully")
except Exception as e:
    print(f"   ✗ Emotional service import failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

try:
    print("8. Importing vision service...")
    from services.vision import vision_service
    print("   ✓ Vision service imported successfully")
except Exception as e:
    print(f"   ✗ Vision service import failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

try:
    print("9. Importing orchestrator service...")
    from services.orchestrator import orchestrator_service
    print("   ✓ Orchestrator service imported successfully")
except Exception as e:
    print(f"   ✗ Orchestrator service import failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

try:
    print("10. Importing ml_predictions...")
    from services.ml_predictions import ml_predictions
    print("   ✓ ML predictions imported successfully")
except Exception as e:
    print(f"   ✗ ML predictions import failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

try:
    print("11. Importing mlops service...")
    from mlops import mlops_service
    print("   ✓ MLOps service imported successfully")
except Exception as e:
    print(f"   ✗ MLOps service import failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

try:
    print("12. Importing main...")
    import main
    print("   ✓ Main module imported successfully")
except Exception as e:
    print(f"   ✗ Main module import failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print()
print("=" * 60)
print("✓ ALL IMPORTS SUCCESSFUL!")
print("=" * 60)
