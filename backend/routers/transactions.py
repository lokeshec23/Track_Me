from fastapi import APIRouter, Body, HTTPException, Depends, Request
from backend.database import transaction_collection
from backend.models.transaction import TransactionSchema, CreateTransactionSchema
from backend.routers.auth import get_current_user
from typing import List
from bson import ObjectId

router = APIRouter()

def transaction_helper(transaction) -> dict:
    return {
        "id": str(transaction["_id"]),
        "amount": transaction["amount"],
        "description": transaction.get("description"),
        "categoryId": transaction["categoryId"],
        "date": transaction["date"],
        "type": transaction["type"],
        "paymentMode": transaction.get("paymentMode"),
        "user_id": transaction["user_id"]
    }

@router.get("/", response_description="Retrieve all transactions")
async def get_transactions(current_user: dict = Depends(get_current_user)):
    transactions = []
    async for transaction in transaction_collection.find({"user_id": str(current_user["_id"])}):
        transactions.append(transaction_helper(transaction))
    return transactions

@router.post("/", response_description="Add a transaction")
async def add_transaction(transaction: CreateTransactionSchema = Body(...), current_user: dict = Depends(get_current_user)):
    transaction_data = transaction.dict()
    transaction_data["user_id"] = str(current_user["_id"])
    new_transaction = await transaction_collection.insert_one(transaction_data)
    created_transaction = await transaction_collection.find_one({"_id": new_transaction.inserted_id})
    return transaction_helper(created_transaction)

@router.put("/{id}", response_description="Update a transaction")
async def update_transaction(id: str, req: CreateTransactionSchema = Body(...), current_user: dict = Depends(get_current_user)):
    transaction = await transaction_collection.find_one({"_id": ObjectId(id), "user_id": str(current_user["_id"])})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    updated_data = req.dict()
    await transaction_collection.update_one({"_id": ObjectId(id)}, {"$set": updated_data})
    
    # Return updated transaction
    updated_transaction = await transaction_collection.find_one({"_id": ObjectId(id)})
    return transaction_helper(updated_transaction)

@router.delete("/{id}", response_description="Delete a transaction")
async def delete_transaction(id: str, current_user: dict = Depends(get_current_user)):
    transaction = await transaction_collection.find_one({"_id": ObjectId(id), "user_id": str(current_user["_id"])})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    await transaction_collection.delete_one({"_id": ObjectId(id)})
    return {"message": "Transaction deleted successfully"}

@router.post("/sync", response_description="Sync local transactions")
async def sync_transactions(transactions: List[CreateTransactionSchema] = Body(...), current_user: dict = Depends(get_current_user)):
    inserted_ids = []
    for txn in transactions:
        txn_data = txn.dict()
        txn_data["user_id"] = str(current_user["_id"])
        result = await transaction_collection.insert_one(txn_data)
        inserted_ids.append(str(result.inserted_id))
    
    return {"message": f"Synced {len(inserted_ids)} transactions", "ids": inserted_ids}
