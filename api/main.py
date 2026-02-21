"""
FastAPI application for Hedge Fund Tracker API.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.config import config
from api.routes import health, funds, stocks, analysis, filings, ai, settings, database

# Create FastAPI app
app = FastAPI(
    title="Hedge Fund Tracker API",
    description="RESTful API for analyzing hedge fund portfolios and AI-powered stock research",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.API_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(health.router)
app.include_router(funds.router)
app.include_router(stocks.router)
app.include_router(analysis.router)
app.include_router(filings.router)
app.include_router(ai.router)
app.include_router(settings.router)
app.include_router(database.router)


@app.on_event("startup")
async def startup_event():
    """Initialize application on startup."""
    config.ensure_directories()


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Hedge Fund Tracker API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "api.main:app",
        host=config.API_HOST,
        port=config.API_PORT,
        reload=True
    )
