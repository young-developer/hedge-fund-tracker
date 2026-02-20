"""
Quarter analysis API endpoints.
"""
import logging
from fastapi import APIRouter
from api.services.analysis_service import AnalysisService
from api.models.api_response import APIResponse
from app.utils.database import get_all_quarters

router = APIRouter(prefix="/api/analysis", tags=["analysis"])

logger = logging.getLogger(__name__)


@router.get("/quarters", response_model=APIResponse)
async def get_quarters():
    """Get all available quarters."""
    try:
        logger.info("Getting all available quarters")
        quarters = AnalysisService.get_all_quarters()
        logger.info(f"Successfully retrieved {len(quarters)} quarters")
        return APIResponse(
            success=True,
            data=quarters,
            message=f"Retrieved {len(quarters)} quarters"
        )
    except Exception as e:
        logger.error(f"Failed to retrieve quarters: {e}", exc_info=True)
        import traceback
        logger.error(f"Stack trace:\n{traceback.format_exc()}")
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to retrieve quarters"
        )


@router.get("/quarters/all", response_model=APIResponse)
async def get_all_available_quarters():
    """Get all available quarters in the database."""
    try:
        logger.info("Getting all available quarters from database")
        quarters = get_all_quarters()
        if not quarters:
            logger.warning("No quarters available in database")
            return APIResponse(
                success=False,
                error="No quarters available",
                message="No data available"
            )
        logger.info(f"Successfully retrieved {len(quarters)} quarters")
        return APIResponse(
            success=True,
            data=quarters,
            message=f"Retrieved {len(quarters)} quarters"
        )
    except Exception as e:
        logger.error(f"Failed to retrieve quarters: {e}", exc_info=True)
        import traceback
        logger.error(f"Stack trace:\n{traceback.format_exc()}")
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to retrieve quarters"
        )


@router.get("/quarters/{quarter}", response_model=APIResponse)
async def get_quarter_analysis(quarter: str):
    """Get comprehensive quarter analysis."""
    try:
        logger.info(f"Getting quarter analysis for: {quarter}")
        analysis = AnalysisService.get_quarter_analysis(quarter)
        if "error" in analysis:
            logger.error(f"Quarter analysis failed for {quarter}: {analysis['error']}")
            return APIResponse(
                success=False,
                error=analysis["error"],
                message="Quarter analysis failed"
            )

        logger.info(f"Successfully retrieved quarter analysis for {quarter}")
        return APIResponse(
            success=True,
            data=analysis,
            message=f"Quarter analysis for {quarter}"
        )
    except Exception as e:
        logger.error(f"Failed to retrieve quarter analysis for {quarter}: {e}", exc_info=True)
        import traceback
        logger.error(f"Stack trace:\n{traceback.format_exc()}")
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to retrieve quarter analysis"
        )


@router.get("/last-quarter", response_model=APIResponse)
async def get_last_quarter():
    """Get the last available quarter."""
    try:
        logger.info("Getting last available quarter")
        from app.utils.database import get_last_quarter as db_get_last_quarter
        last_quarter = db_get_last_quarter()
        if not last_quarter:
            logger.warning("No quarters available in database")
            return APIResponse(
                success=False,
                error="No quarters available",
                message="No data available"
            )
        logger.info(f"Successfully retrieved last quarter: {last_quarter}")
        return APIResponse(
            success=True,
            data={"quarter": last_quarter},
            message=f"Retrieved last quarter: {last_quarter}"
        )
    except Exception as e:
        logger.error(f"Failed to retrieve last quarter: {e}", exc_info=True)
        import traceback
        logger.error(f"Stack trace:\n{traceback.format_exc()}")
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to retrieve last quarter"
        )


@router.get("/quarters/all", response_model=APIResponse)
async def get_all_available_quarters():
    """Get all available quarters in the database."""
    try:
        logger.info("Getting all available quarters from database")
        from app.utils.database import get_all_quarters
        quarters = get_all_quarters()
        if not quarters:
            logger.warning("No quarters available in database")
            return APIResponse(
                success=False,
                error="No quarters available",
                message="No data available"
            )
        logger.info(f"Successfully retrieved {len(quarters)} quarters")
        return APIResponse(
            success=True,
            data=quarters,
            message=f"Retrieved {len(quarters)} quarters"
        )
    except Exception as e:
        logger.error(f"Failed to retrieve quarters: {e}", exc_info=True)
        import traceback
        logger.error(f"Stack trace:\n{traceback.format_exc()}")
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to retrieve quarters"
        )
