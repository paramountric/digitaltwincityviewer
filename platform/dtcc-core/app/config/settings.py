import os
from pathlib import Path
from typing import Dict, Any

class Settings():
    # Base Paths
    BASE_DIR: Path = Path(__file__).parent.parent.parent
    DATA_DIR: Path = BASE_DIR / "data/data" # because dtcc download uses data folder
    TEMP_DIR: Path = BASE_DIR / "data/temp"
    
    # DTCC Core Settings
    DEFAULT_CITY_CONFIG: Dict[str, Any] = {
        "data_directory": "helsingborg-residential-2022",
        "mesh_size": 0.5,
        "detail_level": 2
    }
    
    # API Settings
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "DTCC Core Worker"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # Processing Settings
    MAX_WORKERS: int = os.getenv("MAX_WORKERS", 4)
    CHUNK_SIZE: int = 1000
    
    # File Settings
    ALLOWED_EXTENSIONS: list[str] = [".json", ".geojson", ".obj", ".xml"]
    MAX_FILE_SIZE: int = 100 * 1024 * 1024  # 100MB
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    class Config:
        case_sensitive = True
        env_file = ".env"

# Create settings instance
settings = Settings()

# Export commonly used variables
DATA_DIR = settings.DATA_DIR
TEMP_DIR = settings.TEMP_DIR
API_V1_PREFIX = settings.API_V1_PREFIX
DEFAULT_CITY_CONFIG = settings.DEFAULT_CITY_CONFIG

# Ensure required directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
TEMP_DIR.mkdir(parents=True, exist_ok=True)
