from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import rates, orders, chat, admin

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="High-performance backend API for Kyrgyzstan B2C USDT purchasing platform supporting KGS/USD via Visa & Mastercard."
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(rates.router, prefix=settings.API_V1_STR)
app.include_router(orders.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "region": "Kyrgyzstan (Bishkek / Osh / Remote)",
        "supported_currencies": ["KGS", "USD"],
        "supported_networks": ["TRC20", "BEP20", "ERC20", "TON"]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
