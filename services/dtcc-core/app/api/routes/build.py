from fastapi import APIRouter, HTTPException
from app.services.city_builder import CityBuilder
from app.models.schemas import ProcessConfig

router = APIRouter(tags=["build"])

@router.post("")
async def build_city(config: ProcessConfig):
    """
    Build a city model using DTCC Core with the provided configuration.
    
    Args:
        config: ProcessConfig containing build parameters and paths
        
    Returns:
        Dict containing build status and output paths
    """
    try:
        builder = CityBuilder()
        result = await builder.process_city(config)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))