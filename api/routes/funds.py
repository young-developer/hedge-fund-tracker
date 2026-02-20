"""
Fund-related API endpoints.
"""
from fastapi import APIRouter, HTTPException
from api.services.fund_service import FundService
from api.models.api_response import APIResponse
import sys

router = APIRouter(prefix="/api/funds", tags=["funds"])


@router.get("", response_model=APIResponse)
async def get_all_funds():
    """Get all tracked funds."""
    try:
        funds = FundService.get_all_funds()
        return APIResponse(
            success=True,
            data=funds,
            message=f"Retrieved {len(funds)} funds"
        )
    except Exception as e:
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to retrieve funds"
        )


@router.get("/{fund_name}/quarters", response_model=APIResponse)
async def get_fund_quarters(fund_name: str):
    """Get all quarters for a specific fund."""
    try:
        quarters = FundService.get_fund_quarters(fund_name)
        return APIResponse(
            success=True,
            data=quarters,
            message=f"Retrieved {len(quarters)} quarters for {fund_name}"
        )
    except Exception as e:
        return APIResponse(
            success=False,
            error=str(e),
            message=f"Failed to retrieve quarters for {fund_name}"
        )


@router.get("/{fund_name}/holdings/{quarter}", response_model=APIResponse)
async def get_fund_holdings(fund_name: str, quarter: str):
    """Get fund holdings for a specific quarter."""
    try:
        holdings = FundService.get_fund_holdings(fund_name, quarter)
        if holdings.empty:
            return APIResponse(
                success=False,
                error=f"No holdings found for {fund_name} in {quarter}",
                message="No data available"
            )

        # Convert to list for JSON serialization
        holdings_list = holdings.to_dict('records')
        # Ensure all keys are uppercase for UI compatibility
        holdings_list = [{k.upper(): v for k, v in holding.items()} for holding in holdings_list]
        return APIResponse(
            success=True,
            data=holdings_list,
            message=f"Retrieved {len(holdings_list)} holdings"
        )
    except Exception as e:
        return APIResponse(
            success=False,
            error=str(e),
            message=f"Failed to retrieve holdings"
        )


@router.get("/{fund_name}/performance/{quarter}", response_model=APIResponse)
async def get_fund_performance(fund_name: str, quarter: str):
    """Get fund performance evaluation for a specific quarter."""
    try:
        performance = FundService.get_fund_performance(fund_name, quarter)
        if "error" in performance:
            return APIResponse(
                success=False,
                error=performance["error"],
                message="Performance evaluation failed"
            )

        return APIResponse(
            success=True,
            data=performance,
            message=f"Performance for {fund_name} in {quarter}"
        )
    except Exception as e:
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to retrieve performance"
        )


@router.get("/quarters/{quarter}", response_model=APIResponse)
async def get_quarter_funds(quarter: str):
    """Get all funds for a specific quarter."""
    try:
        quarters_summary = FundService.get_fund_quarters_summary(quarter)
        return APIResponse(
            success=True,
            data=quarters_summary,
            message=f"Retrieved {len(quarters_summary)} funds for {quarter}"
        )
    except Exception as e:
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to retrieve funds for quarter"
        )


@router.get("/{fund_name}/last-quarter", response_model=APIResponse)
async def get_fund_last_quarter(fund_name: str):
    """Get the most recent quarter for a specific fund."""
    try:
        last_quarter = FundService.get_fund_last_quarter(fund_name)
        if not last_quarter:
            return APIResponse(
                success=False,
                error=f"No quarters found for {fund_name}",
                message="No data available"
            )
        return APIResponse(
            success=True,
            data={"quarter": last_quarter},
            message=f"Retrieved last quarter for {fund_name}: {last_quarter}"
        )
    except Exception as e:
        return APIResponse(
            success=False,
            error=str(e),
            message=f"Failed to retrieve last quarter for {fund_name}"
        )


@router.get("/{fund_name}/data/{quarter}", response_model=APIResponse)
async def get_fund_data(fund_name: str, quarter: str):
    """Get raw 13F data for a specific fund and quarter."""
    try:
        data = FundService.get_fund_data(fund_name, quarter)
        if data.empty:
            return APIResponse(
                success=False,
                error=f"No data found for {fund_name} in {quarter}",
                message="No data available"
            )

        data_list = data.to_dict('records')
        return APIResponse(
            success=True,
            data=data_list,
            message=f"Retrieved {len(data_list)} holdings for {fund_name} in {quarter}"
        )
    except Exception as e:
        return APIResponse(
            success=False,
            error=str(e),
            message=f"Failed to retrieve fund data"
        )
