"""
AI analysis API endpoints.
"""
import logging
from fastapi import APIRouter, HTTPException
from api.services.ai_service import AIService
from api.models.api_response import APIResponse
from api.models.reports import ReportResponse, ReportListResponse

router = APIRouter(prefix="/api/ai", tags=["ai"])

logger = logging.getLogger(__name__)


@router.get("/models", response_model=APIResponse)
async def get_ai_models():
    """Get available AI models."""
    try:
        logger.info("Getting available AI models")
        models = AIService.get_available_models()
        logger.info(f"Successfully retrieved {len(models)} AI models")
        return APIResponse(
            success=True,
            data=models,
            message=f"Retrieved {len(models)} AI models"
        )
    except Exception as e:
        logger.error(f"Failed to retrieve AI models: {e}", exc_info=True)
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to retrieve AI models"
        )


@router.post("/analyst", response_model=APIResponse)
async def run_ai_analyst(request: dict):
    """Generate AI analyst ranked list of promising stocks."""
    try:
        logger.info(f"Running AI analyst for quarter: {request.get('quarter')}, model: {request.get('model_id')}")
        quarter = request.get("quarter")
        top_n = request.get("top_n", 30)
        model_id = request.get("model_id")

        if not quarter:
            logger.warning("Missing quarter parameter")
            return APIResponse(
                success=False,
                error="quarter is required",
                message="Missing required parameter: quarter"
            )

        logger.info(f"Calling AIService.get_ai_analyst(quarter={quarter}, top_n={top_n}, model_id={model_id})")
        result = AIService.get_ai_analyst(quarter, top_n, model_id)

        if "error" in result:
            logger.error(f"AI analyst failed with error: {result['error']}")
            return APIResponse(
                success=False,
                error=result["error"],
                message="AI analyst failed"
            )

        logger.info(f"Successfully generated AI analysis for {quarter}")
        return APIResponse(
            success=True,
            data=result,
            message=f"AI analysis for {quarter}"
        )
    except Exception as e:
        logger.error(f"Failed to run AI analyst: {e}", exc_info=True)
        import traceback
        logger.error(f"Stack trace:\n{traceback.format_exc()}")
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to run AI analyst"
        )


@router.post("/due-diligence", response_model=APIResponse)
async def run_ai_due_diligence(request: dict):
    """Run AI due diligence on a stock."""
    try:
        logger.info(f"Running AI due diligence for ticker: {request.get('ticker')}, quarter: {request.get('quarter')}")
        ticker = request.get("ticker")
        quarter = request.get("quarter")
        model_id = request.get("model_id")

        if not ticker or not quarter:
            logger.warning("Missing required parameters for due diligence")
            return APIResponse(
                success=False,
                error="ticker and quarter are required",
                message="Missing required parameters: ticker and quarter"
            )

        logger.info(f"Calling AIService.get_ai_due_diligence(ticker={ticker}, quarter={quarter}, model_id={model_id})")
        result = AIService.get_ai_due_diligence(ticker, quarter, model_id)

        if "error" in result:
            logger.error(f"AI due diligence failed with error: {result['error']}")
            return APIResponse(
                success=False,
                error=result["error"],
                message="AI due diligence failed"
            )

        logger.info(f"Successfully completed AI due diligence for {ticker}")
        return APIResponse(
            success=True,
            data=result,
            message=f"AI due diligence for {ticker}"
        )
    except Exception as e:
        logger.error(f"Failed to run AI due diligence: {e}", exc_info=True)
        import traceback
        logger.error(f"Stack trace:\n{traceback.format_exc()}")
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to run AI due diligence"
        )


@router.get("/reports/analyst", response_model=ReportListResponse)
async def get_ai_analyst_reports():
    """Get all AI analyst reports."""
    try:
        logger.info("Getting all AI analyst reports")
        reports = AIService.get_all_ai_analyst_reports()
        logger.info(f"Successfully retrieved {len(reports)} AI analyst reports")
        return ReportResponse(
            success=True,
            data=reports,
            message=f"Retrieved {len(reports)} AI analyst reports"
        )
    except Exception as e:
        logger.error(f"Failed to retrieve AI analyst reports: {e}", exc_info=True)
        return ReportResponse(
            success=False,
            error=str(e),
            message="Failed to retrieve AI analyst reports"
        )


@router.get("/reports/analyst/latest", response_model=ReportResponse)
async def get_last_ai_analyst_report():
    """Get the most recent AI analyst report."""
    try:
        logger.info("Getting last AI analyst report")
        report = AIService.get_last_ai_analyst_report()
        if report:
            logger.info("Successfully retrieved last AI analyst report")
            return ReportResponse(
                success=True,
                data=report,
                message="Retrieved last AI analyst report"
            )
        else:
            logger.info("No AI analyst reports found")
            return ReportResponse(
                success=False,
                error="No reports found",
                message="No AI analyst reports available"
            )
    except Exception as e:
        logger.error(f"Failed to get last AI analyst report: {e}", exc_info=True)
        return ReportResponse(
            success=False,
            error=str(e),
            message="Failed to get last AI analyst report"
        )


@router.get("/reports/analyst/{report_id}", response_model=ReportResponse)
async def get_ai_analyst_report(report_id: str):
    """Get a specific AI analyst report by ID."""
    try:
        logger.info(f"Retrieving AI analyst report: {report_id}")
        report = AIService.get_ai_analyst_report(report_id)
        if report:
            logger.info("Successfully retrieved AI analyst report")
            return ReportResponse(
                success=True,
                data=report,
                message=f"Retrieved AI analyst report {report_id}"
            )
        else:
            logger.warning(f"AI analyst report not found: {report_id}")
            return ReportResponse(
                success=False,
                error=f"Report {report_id} not found",
                message=f"AI analyst report {report_id} not found"
            )
    except Exception as e:
        logger.error(f"Failed to get AI analyst report: {e}", exc_info=True)
        return ReportResponse(
            success=False,
            error=str(e),
            message="Failed to get AI analyst report"
        )


@router.get("/reports/due-diligence", response_model=ReportListResponse)
async def get_ai_due_diligence_reports():
    """Get all AI due diligence reports."""
    try:
        logger.info("Getting all AI due diligence reports")
        reports = AIService.get_all_ai_due_diligence_reports()
        logger.info(f"Successfully retrieved {len(reports)} AI due diligence reports")
        return ReportResponse(
            success=True,
            data=reports,
            message=f"Retrieved {len(reports)} AI due diligence reports"
        )
    except Exception as e:
        logger.error(f"Failed to retrieve AI due diligence reports: {e}", exc_info=True)
        return ReportResponse(
            success=False,
            error=str(e),
            message="Failed to retrieve AI due diligence reports"
        )


@router.get("/reports/due-diligence/latest", response_model=ReportResponse)
async def get_last_ai_due_diligence_report():
    """Get the most recent AI due diligence report."""
    try:
        logger.info("Getting last AI due diligence report")
        report = AIService.get_last_ai_due_diligence_report()
        if report:
            logger.info("Successfully retrieved last AI due diligence report")
            return ReportResponse(
                success=True,
                data=report,
                message="Retrieved last AI due diligence report"
            )
        else:
            logger.info("No AI due diligence reports found")
            return ReportResponse(
                success=False,
                error="No reports found",
                message="No AI due diligence reports available"
            )
    except Exception as e:
        logger.error(f"Failed to get last AI due diligence report: {e}", exc_info=True)
        return ReportResponse(
            success=False,
            error=str(e),
            message="Failed to get last AI due diligence report"
        )


@router.get("/reports/due-diligence/{report_id}", response_model=ReportResponse)
async def get_ai_due_diligence_report(report_id: str):
    """Get a specific AI due diligence report by ID."""
    try:
        logger.info(f"Retrieving AI due diligence report: {report_id}")
        report = AIService.get_ai_due_diligence_report(report_id)
        if report:
            logger.info("Successfully retrieved AI due diligence report")
            return ReportResponse(
                success=True,
                data=report,
                message=f"Retrieved AI due diligence report {report_id}"
            )
        else:
            logger.warning(f"AI due diligence report not found: {report_id}")
            return ReportResponse(
                success=False,
                error=f"Report {report_id} not found",
                message=f"AI due diligence report {report_id} not found"
            )
    except Exception as e:
        logger.error(f"Failed to get AI due diligence report: {e}", exc_info=True)
        return ReportResponse(
            success=False,
            error=str(e),
            message="Failed to get AI due diligence report"
        )
