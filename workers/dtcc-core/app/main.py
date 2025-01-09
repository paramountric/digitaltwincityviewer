import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import json
from pydantic import BaseModel
from pathlib import Path
from typing import Dict, Any, Optional

from dtcc_model import City    # For city model operations
from dtcc_builder import build # For building operations

# Define the data directory in the volume
DATA_DIR = Path("/app/data")
DOWNLOADS_DIR = DATA_DIR / "downloads"

class ProcessConfig(BaseModel):
    config: Dict[str, Any]  # This allows for flexible configuration objects

class DataLoadConfig(BaseModel):
    file_path: str
    format: Optional[str] = None
    name: str  # Name to save the file as

app = FastAPI(title="DTCC Core Service")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development - restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello from DTCC Core!!"}

@app.post("/process")
async def process(config: ProcessConfig):
    try:
        print(f"Received process request with config: {config.config}")
        # Todo: Add processing here
        return {
            "status": "success",
            "message": "Processing started",
            "config": config.config
        }
    except Exception as e:
        print(f"Error processing request: {e}")
        return {
            "status": "error",
            "message": str(e)
        }
    
@app.post("/data/load")
async def load_data(config: DataLoadConfig):
    """Load data using the DTCC platform"""
    try:
        # Ensure directories exist
        DOWNLOADS_DIR.mkdir(parents=True, exist_ok=True)
        
        # Define the target path in our volume
        target_path = DOWNLOADS_DIR / config.name
        
        print(f"Loading data from {config.file_path} to {target_path}")
        
        # Here we'll use dtcc to load the data
        # This is placeholder until we know the exact dtcc API
        data = dtcc.load(config.file_path)
        
        # Save the data to our volume
        dtcc.save(data, str(target_path))
        
        return {
            "status": "success",
            "message": f"Data loaded from {config.file_path}",
            "saved_to": str(target_path),
            "format": config.format
        }
    except Exception as e:
        print(f"Error loading data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}