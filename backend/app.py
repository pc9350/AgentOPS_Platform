"""
AgentOps Platform - Main FastAPI Application
Multi-Agent Evaluation, Telemetry & Optimization System
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import get_settings
from routers import evaluate, conversations


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    print("🚀 AgentOps Platform starting up...")
    yield
    # Shutdown
    print("👋 AgentOps Platform shutting down...")


# Initialize FastAPI app
app = FastAPI(
    title="AgentOps Platform",
    description="Multi-Agent Evaluation, Telemetry & Optimization System",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(evaluate.router, prefix="/api", tags=["Evaluation"])
app.include_router(conversations.router, prefix="/api", tags=["Conversations"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "AgentOps Platform",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

