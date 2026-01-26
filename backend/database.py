from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_DETAILS = os.getenv("MONGO_DETAILS", "mongodb://localhost:27017")

client = AsyncIOMotorClient(MONGO_DETAILS)

database = client.track_me

user_collection = database.get_collection("users")
transaction_collection = database.get_collection("transactions")
goal_collection = database.get_collection("goals")
budget_collection = database.get_collection("budgets")
recurring_collection = database.get_collection("recurring")
category_collection = database.get_collection("categories")


