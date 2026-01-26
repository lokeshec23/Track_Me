from fastapi import APIRouter, Body, HTTPException, Depends
from backend.database import goal_collection
from backend.models.goals import GoalSchema, CreateGoalSchema
from backend.routers.auth import get_current_user
from typing import List
from bson import ObjectId

router = APIRouter()

def goal_helper(goal) -> dict:
    return {
        "id": str(goal["_id"]),
        "user_id": goal["user_id"],
        "name": goal["name"],
        "targetAmount": goal["targetAmount"],
        "currentAmount": goal.get("currentAmount", 0.0),
        "deadline": goal.get("deadline"),
        "category": goal.get("category", "other"),
        "icon": goal.get("icon", "🎯"),
        "color": goal.get("color", "#6366f1"),
        "isCompleted": goal.get("isCompleted", False),
        "createdAt": goal.get("createdAt"),
        "updatedAt": goal.get("updatedAt"),
        "completedAt": goal.get("completedAt")
    }

@router.get("/", response_description="Retrieve all goals")
async def get_goals(current_user: dict = Depends(get_current_user)):
    goals = []
    async for goal in goal_collection.find({"user_id": str(current_user["_id"])}):
        goals.append(goal_helper(goal))
    return goals

@router.post("/", response_description="Add a goal")
async def add_goal(goal: CreateGoalSchema = Body(...), current_user: dict = Depends(get_current_user)):
    goal_data = goal.dict()
    goal_data["user_id"] = str(current_user["_id"])
    new_goal = await goal_collection.insert_one(goal_data)
    created_goal = await goal_collection.find_one({"_id": new_goal.inserted_id})
    return goal_helper(created_goal)

@router.put("/{id}", response_description="Update a goal")
async def update_goal(id: str, req: dict = Body(...), current_user: dict = Depends(get_current_user)):
    goal = await goal_collection.find_one({"_id": ObjectId(id), "user_id": str(current_user["_id"])})
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    updated_data = {k: v for k, v in req.items() if v is not None}
    await goal_collection.update_one({"_id": ObjectId(id)}, {"$set": updated_data})
    
    updated_goal = await goal_collection.find_one({"_id": ObjectId(id)})
    return goal_helper(updated_goal)

@router.delete("/{id}", response_description="Delete a goal")
async def delete_goal(id: str, current_user: dict = Depends(get_current_user)):
    goal = await goal_collection.find_one({"_id": ObjectId(id), "user_id": str(current_user["_id"])})
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    await goal_collection.delete_one({"_id": ObjectId(id)})
    return {"message": "Goal deleted successfully"}
