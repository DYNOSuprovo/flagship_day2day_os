# Dataset Sources and Instructions

## ✅ Downloaded Datasets

### 1. **Bhagavad Gita (Complete Text)**
- **Source**: Project Gutenberg  
- **File**: `data/bhagavad_gita_full.txt`
- **Size**: ~285KB, full translation by Sir Edwin Arnold
- **Status**: ✅ DOWNLOADED
- **Use**: RAG emotional/spiritual guidance

## 📥 Manual Download Required (Kaggle Account Needed)

### 2. **Indian Food Nutrition Database**

**Option A: Indian Food Nutritional Values (RECOMMENDED)**
- **Link**: https://www.kaggle.com/datasets/schemersays/indian-food-nutritional-values-dataset
- **File**: `Indian_Food_Nutrition_Processed.csv`
- **Size**: 250+ Indian dishes
- **Columns**: calories, protein, carbs, fat, fiber, vitamins, minerals
- **Download**: 
  1. Login to Kaggle
  2. Click "Download"
  3. Extract `Indian_Food_Nutrition_Processed.csv`
  4. Place in: `data/indian_food_nutrition.csv`

**Option B: Nutritional Analysis of Indian Dishes**
- **Link**: https://www.kaggle.com/datasets/nehaprabhavalkar/nutritional-analysis-of-indian-dishes
- **File**: CSV with 89 dishes
- **Use if**: Option A unavailable

###3. **Indian Food Images Dataset**

**Option A: 4000 Images, 80 Categories (COMPREHENSIVE)**
- **Link**: https://www.kaggle.com/datasets/inigolopezrioboo/a-image-dataset-of-indian-food
- **Size**: ~1.2GB
- **Categories**: Biryani, Dal, Paneer, Roti, Samosa, etc.
- **Download**:
  1. Download from Kaggle
  2. Extract to: `data/indian_food_images/`
  3. Use for training food image classifier

**Option B: 20 Categories (QUICK START)**
- **Link**: https://www.kaggle.com/datasets/schemersays/indian-food-101
- **Size**: Smaller, traditional dishes
- **Use if**: Limited storage/bandwidth

## 🎯 Sample Data (Already Created)

While downloading, we have sample data ready:
- `data/indian_foods.json` (9 foods)
- `data/hindu_scriptures.json` (5 verses)
- `data/indian_foods_expanded.json` (50+ foods - auto-generated)

## 📊 API Alternative (No Download Needed)

If Kaggle downloads fail, you can use APIs:

**Ind Nutrient API**
- https://rapidapi.com/Komsorn/api/ind-nutrient-api
- Free tier available
- Programmatic access to Indian food nutrition

## 🚀 Next Steps

1. **Download Kaggle datasets** (requires account)
2. **Place files** in correct locations (see paths above)
3. **Run ingestion**: `python scripts/ingest_data.py`
4. **Train models**: `python scripts/train_models.py`

## 📁 Expected Data Directory Structure

```
data/
├── bhagavad_gita_full.txt          ✅ Downloaded
├── hindu_scriptures.json            ✅ Created
├── indian_foods.json                ✅ Created
├── indian_foods_expanded.json       ✅ Created
├── indian_food_nutrition.csv        ⏳ Manual download
└── indian_food_images/              ⏳ Manual download
    ├── biryani/
    ├── dal/
    ├── paneer/
    └── ... (80 categories)
```

## 💡 Why Manual Downloads?

Kaggle requires authentication and terms acceptance. The datasets are:
- **Free and open-source**
- **High quality** (curated and verified)
- **Comprehensive** (250+ foods, 4000+ images)

This is standard practice for ML projects - APIs have rate limits and paid tiers.

## 🔥 Production Alternative

For a fully automated solution, you can:
1. Use Kaggle API with your API key: `kaggle datasets download -d <dataset-id>`
2. Or build your own web scrapers (food delivery sites, nutrition databases)
3. Or use commercial APIs (Nutritionix, Edamam, etc.)

---

**Status**: Bhagavad Gita ✅ | Nutrition DB ⏳ | Food Images ⏳
