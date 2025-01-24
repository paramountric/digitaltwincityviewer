from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.config.settings import DATA_DIR
from app.api.routes import build_router, health_router

app = FastAPI(
    title="DTCC Core Service",
    redirect_slashes=False
)

data_path = os.getenv('DTCC_DATA_DIR', str(DATA_DIR))

# Mount the data directory to make files accessible
app.mount("/data", StaticFiles(directory=data_path), name="data")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with prefixes
app.include_router(build_router, prefix="/build")
app.include_router(health_router, prefix="/health")
