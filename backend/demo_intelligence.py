import requests
import json
import time

BASE_URL = "http://localhost:8000"

def print_header(title):
    print("\n" + "="*50)
    print(f" {title}")
    print("="*50)

def demo_risk_analysis():
    print_header("LIFESTYLE RISK ANALYZER")
    print("Analyzing patterns for Burnout, Financial, and Health risks...")
    try:
        response = requests.get(f"{BASE_URL}/risk/analysis")
        if response.status_code == 200:
            data = response.json()
            print(f"\nOverall Risk Score: {data['overall_risk_score']}/100")
            
            risks = data['risks']
            for category, details in risks.items():
                print(f"\n[{category.upper()}]")
                print(f"  Score: {details['score']}")
                print(f"  Level: {details['level']}")
                print(f"  Prediction: {details['prediction']}")
        else:
            print(f"Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Connection Failed: {e}")

def demo_memory_fusion():
    print_header("MEMORY FUSION ENGINE (CROSS-DOMAIN REASONING)")
    print("Aggregating Finance, Diet, and Emotional data...")
    print("Sending timeline to Gemini 2.0 for pattern recognition...")
    try:
        response = requests.get(f"{BASE_URL}/memory-fusion/analyze")
        if response.status_code == 200:
            data = response.json()
            insights = data.get('insights', [])
            
            if not insights:
                print("\nNo significant patterns detected yet (need more data).")
            
            for i, insight in enumerate(insights, 1):
                print(f"\nInsight #{i}: {insight['type'].upper()}")
                print(f"  Link: {insight['domain_a']} <--> {insight['domain_b']}")
                print(f"  Analysis: {insight['description']}")
                print(f"  Confidence: {insight['confidence']*100}%")
                print(f"  Action: {insight['action']}")
        else:
            print(f"Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Connection Failed: {e}")

if __name__ == "__main__":
    print("🚀 STARTING SUPER FLAGSHIP INTELLIGENCE DEMO")
    demo_risk_analysis()
    time.sleep(1)
    demo_memory_fusion()
    print("\n" + "="*50)
    print(" DEMO COMPLETE")
    print("="*50)
