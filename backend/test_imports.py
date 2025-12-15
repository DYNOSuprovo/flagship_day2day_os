"""Simple import test"""
import sys
import traceback

print("=" * 60)
print("Testing imports...")
print("=" * 60)

try:
    print("Importing ChromaDB...")
    import chromadb
    print("OK - ChromaDB imported")
except Exception as e:
    print(f"FAILED - ChromaDB: {e}")
    traceback.print_exc()

try:
    print("Importing diet service...")
    from services.diet import diet_service
    print("OK - Diet service imported")
except Exception as e:
    print(f"FAILED - Diet service: {e}")
    traceback.print_exc()

try:
    print("Importing main...")
    import main
    print("OK - Main imported")
except Exception as e:
    print(f"FAILED - Main: {e}")
    traceback.print_exc()

print("=" * 60)
print("Test complete")
