from fastapi import APIRouter
from .orchestrator_graph import orchestrator_graph

router = APIRouter()

@router.post("/chat")
def chat_orchestrator(query: str):
    """
    LangGraph-powered orchestrator that routes queries to multiple agents.
    """
    # Initialize state
    initial_state = {
        "messages": [],
        "query": query,
        "detected_domains": [],
        "diet_response": None,
        "finance_response": None,
        "emotional_response": None,
        "final_response": ""
    }
    
    # Run the graph
    result = orchestrator_graph.invoke(initial_state)
    
    return {
        "query": query,
        "detected_domains": result["detected_domains"],
        "response": result["final_response"]
    }
