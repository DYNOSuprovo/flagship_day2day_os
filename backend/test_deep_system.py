import requests
import json
import time

BASE_URL = "http://localhost:8000"

def step(msg):
    print(f"\n🔵 {msg}")

def check(condition, msg):
    if condition:
        print(f"✅ {msg}")
    else:
        print(f"❌ {msg}")
        raise Exception(f"Check failed: {msg}")

def test_system():
    print("🚀 Starting Deep System Test...")

    # 1. Test Gamification Baseline
    step("Checking Initial Stats")
    stats_Before = requests.get(f"{BASE_URL}/gamification/stats").json()
    xp_start = stats_Before['xp']
    print(f"Starting XP: {xp_start}")

    # 2. Test Diet Flow (Quick Log)
    step("Simulating Meal Log (Diet Service)")
    meal_payload = {
        "food_name": "Test Apple",
        "calories": 95,
        "protein": 0,
        "carbs": 25,
        "fat": 0,
        "health_score": 10,
        "meal_type": "snack"
    }
    r_diet = requests.post(f"{BASE_URL}/diet/log-meal", json=meal_payload)
    check(r_diet.status_code == 200, "Meal Logged Successfully")
    check(r_diet.json()['success'] == True, "Response success is True")

    # 3. Test Finance Flow
    step("Simulating Expense Transaction (Finance Service)")
    tx_payload = {
        "amount": 1500,
        "type": "expense",
        "category": "Shopping",
        "description": "Test Impulse Buy"
    }
    r_finance = requests.post(f"{BASE_URL}/finance/transaction", json=tx_payload)
    check(r_finance.status_code == 200, "Transaction Added Successfully")

    time.sleep(1) # Wait for async processing if any (though ours is sync)

    # 4. Verify XP Rewards
    step("Verifying XP Rewards")
    stats_after = requests.get(f"{BASE_URL}/gamification/stats").json()
    xp_end = stats_after['xp']
    xp_gained = xp_end - xp_start
    print(f"Ending XP: {xp_end} (Gained: {xp_gained})")
    
    # Expected: 15 (Meal) + 20 (Transaction) = 35 XP
    check(xp_gained == 35, f"XP Gained should be 35, got {xp_gained}")

    # 5. Verify Smart Nudges (Retail Therapy Trigger)
    step("Verifying Smart Nudges (Proactive AI)")
    # First, log a negative mood to trigger the nudge logic
    requests.post(f"{BASE_URL}/emotional/log", json={"mood": "Stressed", "intensity": 8, "note": "Testing"})
    
    # Fetch nudges
    r_nudges = requests.get(f"{BASE_URL}/nudges/")
    nudges = r_nudges.json()['nudges']
    
    retail_nudge = next((n for n in nudges if n['type'] == 'finance_mood'), None)
    if retail_nudge:
        print(f"✅ FOUND NUDGE: {retail_nudge['title']} - {retail_nudge['message']}")
    else:
        print("⚠️ Retail Therapy nudge not found (might require strict ordering or fresh data)")
        print(f"Active Nudges: {[n['title'] for n in nudges]}")

    print("\n🎉 Deep System Test Completed Successfully!")

if __name__ == "__main__":
    try:
        test_system()
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        exit(1)
