"""Food database loader and meal selection utilities for diet planning."""
import json
import random
from pathlib import Path
from typing import List, Dict, Optional


class FoodDatabase:
    """Load and manage Indian food database."""
    
    def __init__(self):
        self.foods = []
        self.health_conditions = []
        self._load_database()
    
    def _load_database(self):
        """Load the Indian foods JSON database."""
        # Try multiple possible paths
        possible_paths = [
            Path("../data/indian_foods_expanded.json"),
            Path("../../data/indian_foods_expanded.json"),
            Path("data/indian_foods_expanded.json"),
        ]
        
        for path in possible_paths:
            if path.exists():
                with open(path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.foods = data.get('indian_foods', [])
                    self.health_conditions = data.get('health_conditions', [])
                return
        
        raise FileNotFoundError("Could not find indian_foods_expanded.json")
    
    def filter_by_diet_type(self, diet_type: str) -> List[Dict]:
        """Filter foods by diet type (veg/non-veg/vegan)."""
        diet_map = {
            'veg': 'veg',
            'non-veg': 'non_veg',
            'vegan': 'vegan',
            'vegetarian': 'veg',
            'non_vegetarian': 'non_veg'
        }
        target_diet = diet_map.get(diet_type.lower(), 'veg')
        
        # For vegan, only return vegan foods
        if target_diet == 'vegan':
            return [f for f in self.foods if f.get('diet_type') == 'vegan']
        
        # For non-veg, return both veg and non-veg
        if target_diet == 'non_veg':
            return [f for f in self.foods if f.get('diet_type') in ['veg', 'non_veg']]
        
        # For veg, only return veg
        return [f for f in self.foods if f.get('diet_type') == 'veg']
    
    def filter_by_meal_time(self, foods: List[Dict], meal_time: str) -> List[Dict]:
        """Filter foods suitable for a specific meal time."""
        suitable_foods = []
        for food in foods:
            meal_type = food.get('meal_type', '')
            # Handle underscore-separated meal types like "lunch_dinner"
            if meal_time in meal_type or meal_type == 'any':
                suitable_foods.append(food)
        return suitable_foods


class MealPlanner:
    """Generate balanced meal plans."""
    
    def __init__(self, food_db: FoodDatabase):
        self.food_db = food_db
    
    def generate_plan(self, calories: int, diet_type: str) -> Dict:
        """Generate a complete meal plan based on calorie target and diet type."""
        # Filter foods by diet type
        available_foods = self.food_db.filter_by_diet_type(diet_type)
        
        if not available_foods:
            return self._fallback_plan(calories, diet_type)
        
        # Target calorie distribution
        breakfast_cal = int(calories * 0.25)  # 25%
        lunch_cal = int(calories * 0.35)      # 35%
        snack_cal = int(calories * 0.10)      # 10%
        dinner_cal = int(calories * 0.30)     # 30%
        
        # Generate meals with multiple food items
        meals = []
        total_cal = 0
        total_protein = 0
        total_carbs = 0
        total_fat = 0
        
        # Breakfast
        breakfast = self._compose_meal(available_foods, 'breakfast', breakfast_cal, 'Breakfast')
        if breakfast:
            meals.append(breakfast)
            total_cal += breakfast['calories']
            total_protein += breakfast['protein']
            total_carbs += breakfast.get('carbs', 0)
            total_fat += breakfast.get('fat', 0)
        
        # Lunch
        lunch = self._compose_meal(available_foods, 'lunch', lunch_cal, 'Lunch')
        if lunch:
            meals.append(lunch)
            total_cal += lunch['calories']
            total_protein += lunch['protein']
            total_carbs += lunch.get('carbs', 0)
            total_fat += lunch.get('fat', 0)
        
        # Snack
        snack = self._compose_meal(available_foods, 'snack', snack_cal, 'Snack')
        if snack:
            meals.append(snack)
            total_cal += snack['calories']
            total_protein += snack['protein']
            total_carbs += snack.get('carbs', 0)
            total_fat += snack.get('fat', 0)
        
        # Dinner
        dinner = self._compose_meal(available_foods, 'dinner', dinner_cal, 'Dinner')
        if dinner:
            meals.append(dinner)
            total_cal += dinner['calories']
            total_protein += dinner['protein']
            total_carbs += dinner.get('carbs', 0)
            total_fat += dinner.get('fat', 0)
        
        return {
            'plan_name': f"Custom {calories} Cal {diet_type.title()} Plan",
            'total_calories': round(total_cal),
            'protein': round(total_protein, 1),
            'carbs': round(total_carbs, 1),
            'fat': round(total_fat, 1),
            'meals': meals
        }
    
    def _compose_meal(self, available_foods: List[Dict], meal_time: str, target_calories: int, meal_label: str) -> Optional[Dict]:
        """Compose a meal from multiple food items to match target calories."""
        # Get foods suitable for this meal time
        suitable = self.food_db.filter_by_meal_time(available_foods, meal_time)
        
        if not suitable:
            # Try to find foods that work for lunch_dinner or any
            suitable = [f for f in available_foods if 'dinner' in f.get('meal_type', '') or f.get('meal_type') == 'any']
        
        if not suitable:
            return None
        
        # Select foods to build the meal
        selected_foods = []
        current_calories = 0
        current_protein = 0
        current_carbs = 0
        current_fat = 0
        used_names = set()
        
        # Categorize foods
        main_courses = [f for f in suitable if f.get('category') in ['main_course', 'breakfast']]
        grains = [f for f in suitable if f.get('category') in ['grain', 'bread']]
        sides = [f for f in suitable if f.get('category') in ['side', 'salad', 'curry', 'soup']]
        snacks = [f for f in suitable if f.get('category') in ['snack', 'fruit', 'beverage']]
        
        # Strategy: Select 1-2 main items, then add sides/grains to reach target
        tolerance = 50  # Allow ±50 cal from target
        
        # Add main course
        if main_courses:
            available_mains = [f for f in main_courses if f['name'] not in used_names]
            if available_mains:
                main = random.choice(available_mains)
                selected_foods.append(main)
                current_calories += main['calories']
                current_protein += main.get('protein', 0)
                current_carbs += main.get('carbs', 0)
                current_fat += main.get('fat', 0)
                used_names.add(main['name'])
        
        # Add grain/bread if calories allow
        if grains and current_calories < target_calories - 100:
            available_grains = [f for f in grains if f['name'] not in used_names and f['calories'] <= target_calories - current_calories + tolerance]
            if available_grains:
                grain = random.choice(available_grains)
                # Add 1-2 servings based on need
                servings = min(2, (target_calories - current_calories) // grain['calories'])
                if servings > 0:
                    for _ in range(servings):
                        selected_foods.append(grain)
                        current_calories += grain['calories']
                        current_protein += grain.get('protein', 0)
                        current_carbs += grain.get('carbs', 0)
                        current_fat += grain.get('fat', 0)
                    used_names.add(grain['name'])
        
        # Add side dishes if needed
        if sides and current_calories < target_calories - tolerance:
            available_sides = [f for f in sides if f['name'] not in used_names and f['calories'] <= target_calories - current_calories + tolerance]
            if available_sides:
                side = random.choice(available_sides)
                selected_foods.append(side)
                current_calories += side['calories']
                current_protein += side.get('protein', 0)
                current_carbs += side.get('carbs', 0)
                current_fat += side.get('fat', 0)
                used_names.add(side['name'])
        
        # Add beverage or fruit if still below target
        if snacks and current_calories < target_calories - tolerance:
            available_snacks = [f for f in snacks if f['name'] not in used_names and f['calories'] <= target_calories - current_calories + tolerance]
            if available_snacks:
                snack = random.choice(available_snacks)
                selected_foods.append(snack)
                current_calories += snack['calories']
                current_protein += snack.get('protein', 0)
                current_carbs += snack.get('carbs', 0)
                current_fat += snack.get('fat', 0)
        
        # Build meal name from selected foods
        if not selected_foods:
            return None
        
        food_names = [f['name'] for f in selected_foods]
        meal_name = f"{meal_label}: {', '.join(food_names)}"
        
        return {
            'name': meal_name,
            'calories': round(current_calories),
            'protein': round(current_protein, 1),
            'carbs': round(current_carbs, 1),
            'fat': round(current_fat, 1),
            'items': food_names,
            'meal_type': meal_label
        }
    
    def _fallback_plan(self, calories: int, diet_type: str) -> Dict:
        """Fallback plan if database is unavailable."""
        return {
            'plan_name': f"{calories} Cal {diet_type} Plan",
            'total_calories': calories,
            'protein': int(calories * 0.3 / 4),  # 30% protein
            'carbs': int(calories * 0.5 / 4),    # 50% carbs
            'fat': int(calories * 0.2 / 9),      # 20% fat
            'meals': [
                {'name': 'Breakfast: Idli, Sambar, Coconut Chutney', 'calories': int(calories * 0.25), 'protein': 15},
                {'name': 'Lunch: Dal Tadka, Rice, Roti, Salad', 'calories': int(calories * 0.35), 'protein': 30},
                {'name': 'Snack: Banana, Masala Chai', 'calories': int(calories * 0.10), 'protein': 5},
                {'name': 'Dinner: Paneer Curry, Roti, Raita', 'calories': int(calories * 0.30), 'protein': 25},
            ]
        }
