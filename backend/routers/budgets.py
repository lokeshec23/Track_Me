from fastapi import APIRouter, Body, HTTPException, Depends
from backend.database import budget_collection
from backend.models.budgets import BudgetSchema, CreateBudgetSchema
from backend.routers.auth import get_current_user
from typing import List
from bson import ObjectId

router = APIRouter()

def budget_helper(budget) -> dict:
    return {
        "id": str(budget["_id"]),
        "user_id": budget["user_id"],
        "categoryId": budget["categoryId"],
        "amount": budget["amount"],
        "period": budget.get("period", "monthly"),
        "startDate": budget["startDate"],
        "alertThreshold": budget.get("alertThreshold", 80),
        "createdAt": budget.get("createdAt"),
        "updatedAt": budget.get("updatedAt")
    }

@router.get("/", response_description="Retrieve all budgets")
async def get_budgets(current_user: dict = Depends(get_current_user)):
    budgets = []
    async for budget in budget_collection.find({"user_id": str(current_user["_id"])}):
        budgets.append(budget_helper(budget))
    return budgets

@router.post("/", response_description="Add a budget")
async def add_budget(budget: CreateBudgetSchema = Body(...), current_user: dict = Depends(get_current_user)):
    budget_data = budget.dict()
    budget_data["user_id"] = str(current_user["_id"])
    
    # Check if budget already exists
    existing = await budget_collection.find_one({
        "user_id": str(current_user["_id"]),
        "categoryId": budget_data["categoryId"],
        "period": budget_data.get("period", "monthly")
        # Note: startDate verification for "current" period is complex, assuming frontend handles duplication checks or we add strict backend checks later
    })
    
    # Simple duplicate check could be added here if needed, but allowing multiple for now if dates differ
    
    new_budget = await budget_collection.insert_one(budget_data)
    created_budget = await budget_collection.find_one({"_id": new_budget.inserted_id})
    return budget_helper(created_budget)

@router.put("/{id}", response_description="Update a budget")
async def update_budget(id: str, req: dict = Body(...), current_user: dict = Depends(get_current_user)):
    budget = await budget_collection.find_one({"_id": ObjectId(id), "user_id": str(current_user["_id"])})
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    
    updated_data = {k: v for k, v in req.items() if v is not None}
    await budget_collection.update_one({"_id": ObjectId(id)}, {"$set": updated_data})
    
    updated_budget = await budget_collection.find_one({"_id": ObjectId(id)})
    return budget_helper(updated_budget)

@router.delete("/{id}", response_description="Delete a budget")
async def delete_budget(id: str, current_user: dict = Depends(get_current_user)):
    budget = await budget_collection.find_one({"_id": ObjectId(id), "user_id": str(current_user["_id"])})
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    
    await budget_collection.delete_one({"_id": ObjectId(id)})
    return {"message": "Budget deleted successfully"}
