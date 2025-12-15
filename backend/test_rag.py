"""
Test script for RAG endpoints.
Run this to verify the RAG system is working.
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test if server is running."""
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"✅ Server Health: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Server not running: {e}")
        return False

def test_diet_rag():
    """Test RAG-powered diet service."""
    print("\n" + "=" * 60)
    print("TESTING DIET RAG SERVICE")
    print("=" * 60)
    
    try:
        response = requests.post(
            f"{BASE_URL}/diet/plan-rag",
            params={
                "query": "I want to lose weight with vegetarian food",
                "calories": 1800,
                "diet_type": "veg",
                "health_conditions": []
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Diet RAG Response:")
            print(f"   Query: {result.get('query')}")
            print(f"   Plan: {result.get('plan')[:200]}...")
            print(f"   Sources Used: {len(result.get('sources_used', []))}")
            print(f"   Docs Retrieved: {result.get('num_docs_retrieved')}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Error: {e}")

def test_emotional_rag():
    """Test RAG-powered emotional service."""
    print("\n" + "=" * 60)
    print("TESTING EMOTIONAL/SPIRITUAL RAG SERVICE")
    print("=" * 60)
    
    try:
        response = requests.post(
            f"{BASE_URL}/emotional/guidance-rag",
            params={
                "mood": "anxious",
                "situation": "exam stress"
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Emotional RAG Response:")
            print(f"   Mood: {result.get('mood')}")
            print(f"   Guidance: {result.get('guidance')[:200]}...")
            print(f"   Scriptures Used: {len(result.get('scriptures_used', []))}")
            print(f"   Verses Retrieved: {result.get('num_verses_retrieved')}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Error: {e}")

def test_orchestrator():
    """Test LangGraph orchestrator."""
    print("\n" + "=" * 60)
    print("TESTING LANGGRAPH ORCHESTRATOR")
    print("=" * 60)
    
    try:
        response = requests.post(
            f"{BASE_URL}/orchestrator/chat",
            params={"query": "I feel anxious and I ate too much junk food"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Orchestrator Response:")
            print(f"   Query: {result.get('query')}")
            print(f"   Detected Domains: {result.get('detected_domains')}")
            print(f"   Response: {result.get('response')[:200]}...")
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Error: {e}")

def run_all_tests():
    """Run all tests."""
    print("🧪 TESTING FLAGSHIP PROJECT")
    print("=" * 60)
    
    if not test_health():
        print("\n❌ Server is not running. Start with: uvicorn main:app --reload")
        return
    
    test_diet_rag()
    test_emotional_rag()
    test_orchestrator()
    
    print("\n" + "=" * 60)
    print("✅ ALL TESTS COMPLETE!")
    print("=" * 60)

if __name__ == "__main__":
    run_all_tests()
