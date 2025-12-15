from fastapi import APIRouter, File, UploadFile, HTTPException
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
import os
import base64
import json
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

def get_vision_llm():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Warning: GEMINI_API_KEY not found")
        return None
    return ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        api_key=api_key
    )

@router.post("/analyze-food")
async def analyze_food(file: UploadFile = File(...)):
    """Analyze food image using Gemini Vision."""
    try:
        contents = await file.read()
        image_b64 = base64.b64encode(contents).decode("utf-8")
        
        llm = get_vision_llm()
        if not llm:
            raise HTTPException(status_code=500, detail="LLM not initialized")

        message = HumanMessage(
            content=[
                {
                    "type": "text",
                    "text": "Analyze this food image. Return a JSON object with: 'food_name' (string), 'calories' (integer estimate), 'protein' (integer estimate), 'carbs' (integer estimate), 'fat' (integer estimate), and 'health_score' (1-10 integer). Be concise."
                },
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}
                }
            ]
        )
        
        response = llm.invoke([message])
        
        # Clean up response and parse to JSON
        content = response.content.replace('```json', '').replace('```', '').strip()
        try:
            parsed_result = json.loads(content)
            return parsed_result
        except json.JSONDecodeError:
            return {"result": content, "raw": True, "error": "Could not parse JSON"}

    except Exception as e:
        print(f"Vision error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-receipt")
async def analyze_receipt(file: UploadFile = File(...)):
    """Analyze receipt image using Gemini Vision."""
    try:
        contents = await file.read()
        image_b64 = base64.b64encode(contents).decode("utf-8")
        
        llm = get_vision_llm()
        if not llm:
            raise HTTPException(status_code=500, detail="LLM not initialized")

        message = HumanMessage(
            content=[
                {
                    "type": "text",
                    "text": "Analyze this receipt. Return a JSON object with: 'merchant' (string), 'total_amount' (float), 'date' (string YYYY-MM-DD), 'category' (string e.g., Food, Transport, Shopping). If unclear, estimate."
                },
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}
                }
            ]
        )
        
        response = llm.invoke([message])
        
        # Clean up response and parse to JSON
        content = response.content.replace('```json', '').replace('```', '').strip()
        try:
            parsed_result = json.loads(content)
            return parsed_result
        except json.JSONDecodeError:
            return {"result": content, "raw": True, "error": "Could not parse JSON"}

    except Exception as e:
        print(f"Vision error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
