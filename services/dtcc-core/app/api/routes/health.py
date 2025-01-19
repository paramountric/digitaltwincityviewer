from fastapi import APIRouter
import dtcc

router = APIRouter(tags=["health"])

@router.get("")
async def health_check():
    """
    Basic health check endpoint to verify the service is running
    """
    return {
        "status": "healthy",
        "service": "dtcc-core",
        "dtcc_version": dtcc.__version__
    }

@router.get("/ready")
async def readiness_check():
    """
    Readiness check to verify the service is ready to process requests
    """
    try:
        # Try to access DTCC functionality to ensure the library is working
        _ = dtcc.parameters.default()
        return {
            "status": "ready",
            "message": "DTCC Core is initialized and ready"
        }
    except Exception as e:
        return {
            "status": "not ready",
            "message": f"DTCC Core initialization error: {str(e)}"
        }
