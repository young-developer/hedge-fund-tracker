"""
Quarter analysis API endpoints.
"""
from fastapi import APIRouter
from api.services.analysis_service import AnalysisService
from api.models.api_response import APIResponse

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


@router.get("/quarters", response_model=APIResponse)
async def get_quarters():
    """Get all available quarters."""
    try:
        quarters = AnalysisService.get_all_quarters()
        return APIResponse(
            success=True,
            data=quarters,
            message=f"Retrieved {len(quarters)} quarters"
        )
    except Exception as e:
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to retrieve quarters"
        )


@router.get("/quarters/{quarter}", response_model=APIResponse)
async def get_quarter_analysis(quarter: str):
    """Get comprehensive quarter analysis."""
    try:
        analysis = AnalysisService.get_quarter_analysis(quarter)
        if "error" in analysis:
            return APIResponse(
                success=False,
                error=analysis["error"],
                message="Quarter analysis failed"
            )

        return APIResponse(
            success=True,
            data=analysis,
            message=f"Quarter analysis for {quarter}"
        )
    except Exception as e:
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to retrieve quarter analysis"
        )


@router.get("/last-quarter", response_model=APIResponse)
async def get_last_quarter():
    """Get the last available quarter."""
    try:
        from app.utils.database import get_last_quarter as db_get_last_quarter
        last_quarter = db_get_last_quarter()
        if not last_quarter:
            return APIResponse(
                success=False,
                error="No quarters available",
                message="No data available"
            )
        return APIResponse(
            success=True,
            data={"quarter": last_quarter},
            message=f"Retrieved last quarter: {last_quarter}"
        )
    except Exception as e:
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to retrieve last quarter"
        )


@router.get("/quarters/all", response_model=APIResponse)
async def get_all_available_quarters():
    """Get all available quarters in the database."""
    try:
        from app.utils.database import get_all_quarters
        quarters = get_all_quarters()
        if not quarters:
            return APIResponse(
                success=False,
                error="No quarters available",
                message="No data available"
            )
        return APIResponse(
            success=True,
            data=quarters,
            message=f"Retrieved {len(quarters)} quarters"
        )
    except Exception as e:
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to retrieve quarters"
        )
