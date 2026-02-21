"""
Database update API endpoints.
"""
from fastapi import APIRouter
from api.services.database_service import DatabaseService
from api.models.api_response import APIResponse

router = APIRouter(prefix="/api/database", tags=["database"])


@router.post("/update", response_model=APIResponse)
async def trigger_database_update():
    """Trigger complete database update (13F + non-quarterly filings).

    This is an async operation. Returns immediately with status.
    Progress can be tracked via polling or websockets.
    """
    result = await DatabaseService.run_full_update()
    return APIResponse(
        success=True,
        data=result,
        message="Database update initiated"
    )


@router.get("/status", response_model=APIResponse)
async def get_update_status():
    """Get current database update status."""
    result = await DatabaseService.get_update_status()
    return APIResponse(
        success=True,
        data=result,
        message="Status retrieved"
    )
