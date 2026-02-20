"""
Non-quarterly filings API endpoints.
"""
from fastapi import APIRouter
from api.services.filings_service import FilingsService
from api.models.api_response import APIResponse

router = APIRouter(prefix="/api/filings", tags=["filings"])


@router.get("/recent", response_model=APIResponse)
async def get_recent_filings(days: int = 30):
    """Get recent non-quarterly filings from the last N days."""
    try:
        filings = FilingsService.get_recent_filings(days)
        return APIResponse(
            success=True,
            data=filings,
            message=f"Retrieved {filings['total_filings']} recent filings (last {days} days)"
        )
    except Exception as e:
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to retrieve recent filings"
        )
