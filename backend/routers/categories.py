from fastapi import APIRouter, Body, HTTPException, Depends
from backend.database import category_collection
from backend.models.categories import CategorySchema, CreateCategorySchema
from backend.routers.auth import get_current_user
from typing import List
from bson import ObjectId

router = APIRouter()

# Default expense categories
DEFAULT_CATEGORIES = [
    { "id": 'food', "name": 'Food & Dining', "icon": '🍔', "color": '#f59e0b', "type": 'expense', "isCustom": False },
    { "id": 'transport', "name": 'Transportation', "icon": '🚗', "color": '#3b82f6', "type": 'expense', "isCustom": False },
    { "id": 'shopping', "name": 'Shopping', "icon": '🛍️', "color": '#ec4899', "type": 'expense', "isCustom": False },
    { "id": 'entertainment', "name": 'Entertainment', "icon": '🎬', "color": '#8b5cf6', "type": 'expense', "isCustom": False },
    { "id": 'bills', "name": 'Bills & Utilities', "icon": '💡', "color": '#ef4444', "type": 'expense', "isCustom": False },
    { "id": 'health', "name": 'Healthcare', "icon": '⚕️', "color": '#10b981', "type": 'expense', "isCustom": False },
    { "id": 'education', "name": 'Education', "icon": '📚', "color": '#6366f1', "type": 'expense', "isCustom": False },
    { "id": 'other', "name": 'Other', "icon": '📝', "color": '#64748b', "type": 'expense', "isCustom": False }
]

# Default income categories
DEFAULT_INCOME_CATEGORIES = [
    { "id": 'salary', "name": 'Salary', "icon": '💼', "color": '#10b981', "type": 'income', "isCustom": False },
    { "id": 'freelance', "name": 'Freelance', "icon": '💻', "color": '#3b82f6', "type": 'income', "isCustom": False },
    { "id": 'business', "name": 'Business', "icon": '🏢', "color": '#8b5cf6', "type": 'income', "isCustom": False },
    { "id": 'investment', "name": 'Investment', "icon": '📈', "color": '#f59e0b', "type": 'income', "isCustom": False },
    { "id": 'rental', "name": 'Rental Income', "icon": '🏠', "color": '#ec4899', "type": 'income', "isCustom": False },
    { "id": 'gift', "name": 'Gift/Bonus', "icon": '🎁', "color": '#ef4444', "type": 'income', "isCustom": False },
    { "id": 'other_income', "name": 'Other Income', "icon": '💵', "color": '#64748b', "type": 'income', "isCustom": False }
]

def category_helper(cat) -> dict:
    return {
        "id": str(cat["_id"]),
        "user_id": cat["user_id"],
        "name": cat["name"],
        "icon": cat["icon"],
        "color": cat["color"],
        "type": cat["type"],
        "isCustom": cat.get("isCustom", True)
    }

@router.get("/", response_description="Retrieve all categories (defaults + custom)")
async def get_categories(current_user: dict = Depends(get_current_user)):
    custom_categories = []
    async for cat in category_collection.find({"user_id": str(current_user["_id"])}):
        custom_categories.append(category_helper(cat))
    
    # Merge defaults and custom
    # Ideally frontend separates them or we return a unified list
    # Let's return a single list containing both
    
    all_categories = DEFAULT_CATEGORIES + DEFAULT_INCOME_CATEGORIES + custom_categories
    return all_categories

@router.post("/", response_description="Add a custom category")
async def add_category(category: CreateCategorySchema = Body(...), current_user: dict = Depends(get_current_user)):
    cat_data = category.dict()
    cat_data["user_id"] = str(current_user["_id"])
    cat_data["isCustom"] = True
    
    new_cat = await category_collection.insert_one(cat_data)
    created_cat = await category_collection.find_one({"_id": new_cat.inserted_id})
    return category_helper(created_cat)

@router.delete("/{id}", response_description="Delete a custom category")
async def delete_category(id: str, current_user: dict = Depends(get_current_user)):
    cat = await category_collection.find_one({"_id": ObjectId(id), "user_id": str(current_user["_id"])})
    if not cat:
        # Check if it's a default category (ids are strings like 'food')
        # We can't delete default categories
         raise HTTPException(status_code=400, detail="Cannot delete default category or category not found")
    
    await category_collection.delete_one({"_id": ObjectId(id)})
    return {"message": "Category deleted successfully"}
