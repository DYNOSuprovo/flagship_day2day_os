import requests
import json
import sys

def test_memory():
    url = "http://127.0.0.1:8000/emotional/guidance-rag"
    
    # Step 1: Initial Request
    print("Step 1: Sending initial request...")
    payload1 = {
        "mood": "I feel anxious about the future",
        "history": []
    }
    try:
        response1 = requests.post(url, json=payload1)
        response1.raise_for_status()
        data1 = response1.json()
        guidance1 = data1.get("guidance", "")
        print(f"Response 1: {guidance1[:100]}...")
    except Exception as e:
        print(f"Error in Step 1: {e}")
        return

    # Step 2: Follow-up Request with History
    print("\nStep 2: Sending follow-up request with history...")
    history = [
        {"role": "user", "content": payload1["mood"]},
        {"role": "ai", "content": guidance1}
    ]
    payload2 = {
        "mood": "Can you explain that verse in more detail?",
        "history": history
    }
    
    try:
        response2 = requests.post(url, json=payload2)
        response2.raise_for_status()
        data2 = response2.json()
        guidance2 = data2.get("guidance", "")
        print(f"Response 2: {guidance2[:100]}...")
        
        # Verification
        print("\nVerification:")
        if len(guidance2) > 20:
            print("SUCCESS: Received a meaningful follow-up response.")
        else:
            print("FAILURE: Response seems too short or empty.")
            
    except Exception as e:
        print(f"Error in Step 2: {e}")

if __name__ == "__main__":
    test_memory()
