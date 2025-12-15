"""AI-powered insights generator for dashboard."""
# Imports moved inside functions to prevent hang
print("Loading insights_generator...", flush=True)
import os
import random
from dotenv import load_dotenv

print("Loading dotenv...", flush=True)
load_dotenv()
print("Dotenv loaded.", flush=True)


def get_llm():
    from langchain_google_genai import ChatGoogleGenerativeAI
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Warning: GEMINI_API_KEY not found in environment variables")
        return None
    return ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        api_key=api_key
    )



def generate_insight(context: dict) -> dict:
    """Generate personalized AI insight based on user context."""
    try:
        # Build context summary
        activity_count = context.get('activity_count', 0)
        recent_activities = context.get('recent_activities', [])
        
        from langchain_core.prompts import ChatPromptTemplate
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a friendly AI lifestyle advisor. Generate ONE concise, personalized insight (1-2 sentences) 
            that is encouraging, actionable, and specific to the user's recent activity. Focus on positive reinforcement 
            and gentle suggestions for improvement."""),
            ("user", """Based on user's recent activity:
            - Total activities: {activity_count}
            - Recent actions: {recent_activities}
            
            Generate a friendly, encouraging insight.""")
        ])
        
        llm = get_llm()
        if not llm:
            raise ValueError("LLM not initialized")
            
        chain = prompt | llm
        response = chain.invoke({
            "activity_count": activity_count,
            "recent_activities": ", ".join([a.get('description', '') for a in recent_activities[:3]])
        })
        
        return {
            "message": response.content,
            "confidence": 0.85,
            "tags": ["general"]
        }
    except Exception as e:
        # Fallback insights
        fallback_insights = [
            "Great job staying active! Keep logging your meals to track your nutrition better.",
            "You're building consistent habits! Try the finance tracker to optimize your budget.",
            "Your engagement is impressive! Consider setting specific health goals this week.",
            "Nice work! Combining diet and finance tracking can help you save while eating healthy.",
        ]
        return {
            "message": random.choice(fallback_insights),
            "confidence": 0.5,
            "tags": ["fallback"]
        }
