import traceback
try:
    from services.diet import diet_service
    print("Success")
except Exception:
    traceback.print_exc()
