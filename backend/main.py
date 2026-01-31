from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, transactions, goals, budgets, recurring, categories



app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:5173",  # Vite default port
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, tags=["Authentication"], prefix="/auth")
app.include_router(transactions.router, tags=["Transactions"], prefix="/transactions")
app.include_router(goals.router, tags=["Goals"], prefix="/goals")
app.include_router(budgets.router, tags=["Budgets"], prefix="/budgets")
app.include_router(recurring.router, tags=["Recurring"], prefix="/recurring")
app.include_router(categories.router, tags=["Categories"], prefix="/categories")



@app.get("/")
async def root():
    return {"message": "Welcome to Track Me API"}


@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Backend is running smoothly"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
