from langchain_core.messages import HumanMessage, AIMessage
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated, Sequence
import operator

# Import actual service functions
from services.diet.food_database import FoodDatabase, MealPlanner
from services.finance.finance_service import analyze_budget
from services.emotional.emotional_service import get_emotional_guidance

# Define the state schema
class AgentState(TypedDict):
    messages: Annotated[Sequence[HumanMessage | AIMessage], operator.add]
    query: str
    detected_domains: list[str]
    diet_response: dict | None
    finance_response: dict | None
    emotional_response: dict | None
    final_response: str

# Initialize meal planner lazily
_meal_planner = None

def get_meal_planner():
    global _meal_planner
    if _meal_planner is None:
        try:
            food_db = FoodDatabase()
            _meal_planner = MealPlanner(food_db)
        except Exception as e:
            print(f"Could not initialize meal planner: {e}")
            return None
    return _meal_planner

# Node functions
def analyze_query(state: AgentState) -> AgentState:
    """Analyze the user query and detect which domains are involved."""
    query = state["query"].lower()
    domains = []
    
    diet_keywords = ["food", "diet", "meal", "calorie", "eat", "nutrition", "healthy", "weight", "protein", "vegetarian", "vegan"]
    finance_keywords = ["money", "spend", "budget", "save", "expense", "income", "salary", "cost", "afford", "financial"]
    emotional_keywords = ["sad", "anxious", "stress", "mood", "depressed", "worry", "fear", "angry", "lonely", "peace", "calm"]
    
    if any(word in query for word in diet_keywords):
        domains.append("diet")
    if any(word in query for word in finance_keywords):
        domains.append("finance")
    if any(word in query for word in emotional_keywords):
        domains.append("emotional")
    
    # Default to general help if no domain detected
    if not domains:
        domains.append("general")
    
    state["detected_domains"] = domains
    return state

def call_diet_service(state: AgentState) -> AgentState:
    """Call the diet service if needed."""
    if "diet" in state["detected_domains"]:
        try:
            meal_planner = get_meal_planner()
            if meal_planner:
                # Generate a sample plan based on query keywords
                diet_type = "veg"
                calories = 2000
                
                if "non-veg" in state["query"].lower() or "chicken" in state["query"].lower():
                    diet_type = "non-veg"
                if "vegan" in state["query"].lower():
                    diet_type = "vegan"
                if "1500" in state["query"] or "low calorie" in state["query"].lower():
                    calories = 1500
                if "2500" in state["query"] or "high calorie" in state["query"].lower():
                    calories = 2500
                
                plan = meal_planner.generate_plan(calories, diet_type)
                meals_summary = ", ".join([m["name"].split(":")[0] for m in plan.get("meals", [])[:3]])
                
                state["diet_response"] = {
                    "advice": f"Here's a {calories} cal {diet_type} plan for you: {meals_summary}. Total protein: {plan.get('protein', 0)}g.",
                    "plan": plan
                }
            else:
                state["diet_response"] = {"advice": "Focus on balanced meals with plenty of vegetables, lean protein, and whole grains."}
        except Exception as e:
            state["diet_response"] = {"advice": f"Eat a balanced diet with vegetables, proteins, and whole grains."}
    return state

def call_finance_service(state: AgentState) -> AgentState:
    """Call the finance service if needed."""
    if "finance" in state["detected_domains"]:
        try:
            # Try to extract numbers from query or use defaults
            import re
            numbers = re.findall(r'\d+', state["query"])
            
            if len(numbers) >= 2:
                income = float(numbers[0])
                expenses = float(numbers[1])
            else:
                # Default middle-class Indian values
                income = 50000
                expenses = 35000
            
            result = analyze_budget(income, expenses)
            
            state["finance_response"] = {
                "advice": f"Financial Status: {result['status']}. Savings rate: {result['savings_rate']}%. {result['recommendation']}",
                "details": result
            }
        except Exception as e:
            state["finance_response"] = {"advice": "Track your expenses, save at least 20% of income, and avoid unnecessary spending."}
    return state

def call_emotional_service(state: AgentState) -> AgentState:
    """Call the emotional service if needed."""
    if "emotional" in state["detected_domains"]:
        try:
            # Extract mood from query
            mood = "general"
            if "sad" in state["query"].lower():
                mood = "sad"
            elif "anxious" in state["query"].lower() or "stress" in state["query"].lower():
                mood = "anxious"
            elif "angry" in state["query"].lower():
                mood = "angry"
            elif "lonely" in state["query"].lower():
                mood = "lonely"
            
            result = get_emotional_guidance(mood)
            
            state["emotional_response"] = {
                "advice": result["guidance"],
                "action": result.get("action", "Practice deep breathing.")
            }
        except Exception as e:
            state["emotional_response"] = {"advice": "This too shall pass. Take a deep breath, and remember - you are not alone. (Gita 2.14)"}
    return state

def synthesize_response(state: AgentState) -> AgentState:
    """Combine all responses into a final answer."""
    parts = []
    
    if state.get("diet_response"):
        parts.append(f"🥗 **Diet Advice**: {state['diet_response']['advice']}")
    if state.get("finance_response"):
        parts.append(f"💰 **Financial Guidance**: {state['finance_response']['advice']}")
    if state.get("emotional_response"):
        parts.append(f"🧘 **Emotional Support**: {state['emotional_response']['advice']}")
    
    if not parts:
        state["final_response"] = "I'm your holistic lifestyle advisor! I can help with:\n\n🥗 **Diet & Nutrition** - Meal plans, calorie tracking\n💰 **Finance** - Budgeting, savings advice\n🧘 **Emotional Wellness** - Stress relief, spiritual guidance\n\nWhat would you like help with?"
    else:
        state["final_response"] = "\n\n".join(parts)
    
    return state

# Build the graph
def create_orchestrator_graph():
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("analyze", analyze_query)
    workflow.add_node("diet", call_diet_service)
    workflow.add_node("finance", call_finance_service)
    workflow.add_node("emotional", call_emotional_service)
    workflow.add_node("synthesize", synthesize_response)
    
    # Define the flow
    workflow.set_entry_point("analyze")
    workflow.add_edge("analyze", "diet")
    workflow.add_edge("diet", "finance")
    workflow.add_edge("finance", "emotional")
    workflow.add_edge("emotional", "synthesize")
    workflow.add_edge("synthesize", END)
    
    return workflow.compile()

# Create the graph instance
orchestrator_graph = create_orchestrator_graph()

