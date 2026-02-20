"""
AI analysis API endpoints.
"""
from fastapi import APIRouter
from api.services.ai_service import AIService
from api.models.api_response import APIResponse

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.get("/models", response_model=APIResponse)
async def get_ai_models():
    """Get available AI models."""
    try:
        models = AIService.get_available_models()
        return APIResponse(
            success=True,
            data=models,
            message=f"Retrieved {len(models)} AI models"
        )
    except Exception as e:
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to retrieve AI models"
        )


@router.post("/analyst", response_model=APIResponse)
async def run_ai_analyst(request: dict):
    """Generate AI analyst ranked list of promising stocks."""
    try:
        quarter = request.get("quarter")
        top_n = request.get("top_n", 30)
        model_id = request.get("model_id")

        if not quarter:
            return APIResponse(
                success=False,
                error="quarter is required",
                message="Missing required parameter: quarter"
            )

        result = AIService.get_ai_analyst(quarter, top_n, model_id)
        if "error" in result:
            return APIResponse(
                success=False,
                error=result["error"],
                message="AI analyst failed"
            )

        return APIResponse(
            success=True,
            data=result,
            message=f"AI analysis for {quarter}"
        )
    except Exception as e:
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to run AI analyst"
        )


@router.post("/due-diligence", response_model=APIResponse)
async def run_ai_due_diligence(request: dict):
    """Run AI due diligence on a stock."""
    try:
        ticker = request.get("ticker")
        quarter = request.get("quarter")
        model_id = request.get("model_id")

        if not ticker or not quarter:
            return APIResponse(
                success=False,
                error="ticker and quarter are required",
                message="Missing required parameters: ticker and quarter"
            )

        result = AIService.get_ai_due_diligence(ticker, quarter, model_id)
        if "error" in result:
            return APIResponse(
                success=False,
                error=result["error"],
                message="AI due diligence failed"
            )

        return APIResponse(
            success=True,
            data=result,
            message=f"AI due diligence for {ticker}"
        )
    except Exception as e:
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to run AI due diligence"
        )
