from fastapi import APIRouter, Body, HTTPException, Depends
from database import recurring_collection
from models.recurring import RecurringSchema, CreateRecurringSchema
from routers.auth import get_current_user
from typing import List
from bson import ObjectId

router = APIRouter()

def recurring_helper(recurring) -> dict:
    return {
        "id": str(recurring["_id"]),
        "user_id": recurring["user_id"],
        "type": recurring["type"],
        "amount": recurring["amount"],
        "categoryId": recurring["categoryId"],
        "description": recurring.get("description", ""),
        "frequency": recurring["frequency"],
        "startDate": recurring["startDate"],
        "endDate": recurring.get("endDate"),
        "lastGenerated": recurring.get("lastGenerated"),
        "isActive": recurring.get("isActive", True),
        "createdAt": recurring.get("createdAt"),
        "updatedAt": recurring.get("updatedAt")
    }

@router.get("/", response_description="Retrieve all recurring transactions")
async def get_recurring(current_user: dict = Depends(get_current_user)):
    recurring_txns = []
    async for txn in recurring_collection.find({"user_id": str(current_user["_id"])}):
        recurring_txns.append(recurring_helper(txn))
    return recurring_txns

@router.post("/", response_description="Add a recurring transaction")
async def add_recurring(recurring: CreateRecurringSchema = Body(...), current_user: dict = Depends(get_current_user)):
    recurring_data = recurring.dict()
    recurring_data["user_id"] = str(current_user["_id"])
    
    new_recurring = await recurring_collection.insert_one(recurring_data)
    created_recurring = await recurring_collection.find_one({"_id": new_recurring.inserted_id})
    return recurring_helper(created_recurring)

@router.put("/{id}", response_description="Update a recurring transaction")
async def update_recurring(id: str, req: dict = Body(...), current_user: dict = Depends(get_current_user)):
    recurring = await recurring_collection.find_one({"_id": ObjectId(id), "user_id": str(current_user["_id"])})
    if not recurring:
        raise HTTPException(status_code=404, detail="Recurring transaction not found")
    
    updated_data = {k: v for k, v in req.items() if v is not None}
    await recurring_collection.update_one({"_id": ObjectId(id)}, {"$set": updated_data})
    
    updated_recurring = await recurring_collection.find_one({"_id": ObjectId(id)})
    return recurring_helper(updated_recurring)

@router.delete("/{id}", response_description="Delete a recurring transaction")
async def delete_recurring(id: str, current_user: dict = Depends(get_current_user)):
    recurring = await recurring_collection.find_one({"_id": ObjectId(id), "user_id": str(current_user["_id"])})
    if not recurring:
        raise HTTPException(status_code=404, detail="Recurring transaction not found")
    
    await recurring_collection.delete_one({"_id": ObjectId(id)})
    return {"message": "Recurring transaction deleted successfully"}
