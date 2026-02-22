"""
Portfolio-related API endpoints.
"""
from fastapi import APIRouter, Query
from typing import Optional
from api.services.portfolio_service import (
    get_stock_recommendation,
    get_portfolio_analysis,
    get_stock_holders
)
from api.models.api_response import APIResponse

router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])


@router.get("/recommendation/{ticker}", response_model=APIResponse)
async def get_stock_recommendation_endpoint(ticker: str, quarter: Optional[str] = None):
    """
    Gets a BUY/SELL/HOLD recommendation for a specific stock.

    Args:
        ticker: Stock ticker symbol.
        quarter: Quarter in 'YYYYQN' format (optional).

    Returns:
        Recommendation with label, confidence, and detailed metrics.
    """
    try:
        recommendation = get_stock_recommendation(ticker, quarter)
        if "error" in recommendation:
            return APIResponse(
                success=False,
                error=recommendation["error"],
                message=f"Failed to get recommendation for {ticker}"
            )

        return APIResponse(
            success=True,
            data=recommendation,
            message=f"Recommendation for {ticker}"
        )
    except Exception as e:
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to get stock recommendation"
        )


@router.get("/analysis", response_model=APIResponse)
async def get_portfolio_analysis_endpoint(tickers: str, quarter: Optional[str] = Query(None)):
    """
    Gets analysis for multiple portfolio stocks.

    Args:
        tickers: Comma-separated list of stock tickers.

    Returns:
        List of stock recommendations with metrics.
    """
    try:
        if not tickers or not tickers.strip():
            return APIResponse(
                success=False,
                error="No tickers provided",
                message="Please provide stock tickers"
            )

        ticker_list = [t.strip().upper() for t in tickers.split(',') if t.strip()]

        if not ticker_list:
            return APIResponse(
                success=False,
                error="No valid tickers",
                message="Please provide valid stock tickers"
            )

        recommendations = get_portfolio_analysis(ticker_list, quarter)

        return APIResponse(
            success=True,
            data=recommendations,
            message=f"Analysis for {len(recommendations)} stocks"
        )
    except Exception as e:
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to get portfolio analysis"
        )


@router.get("/{ticker}/holders/{quarter}", response_model=APIResponse)
async def get_stock_holders_endpoint(ticker: str, quarter: str):
    """
    Get fund holders for a stock in a specific quarter.

    Args:
        ticker: Stock ticker symbol.
        quarter: Quarter in 'YYYYQN' format.

    Returns:
        DataFrame with fund-level holdings for the stock.
    """
    try:
        holders = get_stock_holders(ticker, quarter)

        if holders.empty:
            return APIResponse(
                success=False,
                error=f"No holders found for {ticker} in {quarter}",
                message="No data available"
            )

        holders_list = holders.to_dict('records')
        return APIResponse(
            success=True,
            data=holders_list,
            message=f"Retrieved holders for {ticker}"
        )
    except Exception as e:
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to retrieve stock holders"
        )
