from fastapi import APIRouter, HTTPException
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
import chromadb
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Initialize ChromaDB and Gemini lazily
def get_chroma_client():
    client = chromadb.PersistentClient(path="./chroma_db")
    return client

def get_llm():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        api_key=api_key
    )
    return llm


import asyncio

from pydantic import BaseModel
from typing import List, Optional, Dict

class EmotionalGuidanceRequest(BaseModel):
    mood: str
    situation: Optional[str] = None
    history: List[Dict[str, str]] = []

async def get_scripture_rag_response(mood: str, situation: str = None, history: List[Dict[str, str]] = []):
    """RAG-powered spiritual guidance with memory."""
    try:
        # Get scripture collection
        chroma_client = get_chroma_client()
        scripture_collection = chroma_client.get_collection("scripture_knowledge")
        
        # Build search query
        search_query = f"{mood}"
        if situation:
            search_query += f" {situation}"
        
        # Retrieve relevant scriptures
        results = scripture_collection.query(
            query_texts=[search_query],
            n_results=3
        )
        
        # Extract context
        context = "\n\n".join(results["documents"][0]) if results["documents"] else "No relevant scriptures found."
        
        # Format history for prompt
        history_text = ""
        if history:
            history_text = "Chat History:\n" + "\n".join([f"{msg['role'].title()}: {msg['content']}" for msg in history[-5:]]) # Last 5 messages

        # Create prompt template
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a compassionate spiritual guide with deep knowledge of Hindu scriptures.
            Use the provided verses to offer comfort, wisdom, and practical guidance.
            Be empathetic, non-judgmental, and provide actionable steps.
            
            If the user asks a follow-up question, use the Chat History to understand the context."""),
            ("user", """Relevant scriptures:
{context}

{history}

User's current input: {mood}
Situation: {situation}

Provide gentle, compassionate guidance that:
1. Acknowledges their feelings/question
2. Shares the scriptural wisdom (if relevant) or explains previous wisdom
3. Offers practical steps
4. Ends with encouragement""")
        ])
        
        # Generate response
        try:
            llm = get_llm()
            if not llm:
                raise ValueError("LLM not initialized")
            chain = prompt | llm
            # Use ainvoke with timeout (increased to 30s for reliability)
            response = await asyncio.wait_for(
                chain.ainvoke({
                    "context": context,
                    "history": history_text,
                    "mood": mood,
                    "situation": situation or "Not specified"
                }),
                timeout=30.0
            )
            response_text = response.content
        except asyncio.TimeoutError:
            raise Exception("LLM Timeout")
        except Exception as llm_error:
            raise llm_error

    except Exception as e:
        # Fallback: Use the retrieved context directly
        if 'results' in locals() and results["documents"] and results["documents"][0]:
            top_verse = results["documents"][0][0]
            response_text = f"I am sensing a delay in my connection to the divine consciousness, but here is a verse for you:\n\n{top_verse}\n\nReflect on this wisdom."
        else:
            response_text = "I am here with you. Take a deep breath and find peace within."
            
        return {
            "response": response_text,
            "scriptures_cited": results["metadatas"][0] if 'results' in locals() and results["metadatas"] else [],
            "num_verses_retrieved": len(results["documents"][0]) if 'results' in locals() and results["documents"] else 0
        }

    return {
        "response": response_text,
        "scriptures_cited": results["metadatas"][0] if results["metadatas"] else [],
        "num_verses_retrieved": len(results["documents"][0]) if results["documents"] else 0
    }


from database import get_db_connection
from services.gamification.gamification_service import grant_xp

class MoodLog(BaseModel):
    mood: str
    intensity: int = 5
    note: Optional[str] = None

@router.post("/log")
def log_mood(log: MoodLog):
    """Log user mood."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "INSERT INTO mood_logs (mood, intensity, note) VALUES (?, ?, ?)",
            (log.mood, log.intensity, log.note)
        )
        conn.commit()
        conn.close()
        
        # Award XP for emotional awareness
        try:
            grant_xp(1, 10)
        except:
            pass
            
        return {"success": True, "message": "Mood logged successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/guidance-rag")
async def get_rag_emotional_guidance(
    request: EmotionalGuidanceRequest
):
    """Get RAG-powered spiritual guidance with scripture quotes."""
    try:
        # Auto-log the mood from the request if it's not just a query
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO mood_logs (mood, intensity) VALUES (?, ?)",
                (request.mood, 7) # Default intensity for guidance requests
            )
            conn.commit()
            conn.close()
        except:
            pass

        result = await get_scripture_rag_response(request.mood, request.situation, request.history)
        return {
            "mood": request.mood,
            "situation": request.situation,
            "guidance": result["response"],
            "scriptures_used": result["scriptures_cited"],
            "num_verses_retrieved": result["num_verses_retrieved"],
            "method": "RAG + Gemini LLM + Hindu Scriptures"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/guidance")
def get_emotional_guidance(mood: str):
    """Legacy endpoint (non-RAG fallback)."""
    response = "Stay strong!"
    if "sad" in mood.lower():
        response = "Remember, this too shall pass. (Gita 2.14)"
    elif "anxious" in mood.lower():
        response = "Focus on your duty, not the outcome. (Gita 2.47)"
    return {
        "mood": mood,
        "guidance": response,
        "action": "Take 5 deep breaths.",
        "note": "Use /guidance-rag for personalized AI guidance"
    }
