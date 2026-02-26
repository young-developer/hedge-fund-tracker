"""
Portfolio-related API endpoints.
"""
from fastapi import APIRouter, Query
from typing import Optional
from api.services.portfolio_service import (
    get_stock_recommendation,
    get_portfolio_analysis,
    get_stock_holders,
    get_stock_price_by_date,
    get_stock_price_by_quarter,
    get_stock_price_change,
    get_portfolio_price_changes,
    get_portfolio_full_data
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


@router.get("/price/date/{ticker}/{date}", response_model=APIResponse)
async def get_stock_price_by_date_endpoint(ticker: str, date: str):
    """
    Get stock price for a specific date.

    Args:
        ticker: Stock ticker symbol.
        date: Date in 'YYYY-MM-DD' format.

    Returns:
        Price information including ticker, date, price, and price type.
    """
    try:
        price_data = get_stock_price_by_date(ticker, date)

        if "error" in price_data:
            return APIResponse(
                success=False,
                error=price_data["error"],
                message=f"Failed to get price for {ticker} on {date}"
            )

        return APIResponse(
            success=True,
            data=price_data,
            message=f"Price retrieved for {ticker} on {date}"
        )
    except Exception as e:
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to get stock price by date"
        )


@router.get("/price/quarter/{ticker}/{quarter}", response_model=APIResponse)
async def get_stock_price_by_quarter_endpoint(ticker: str, quarter: str):
    """
    Get stock price at quarter-end (when funds report).

    Args:
        ticker: Stock ticker symbol.
        quarter: Quarter in 'YYYYQN' format.

    Returns:
        Price information including ticker, quarter, quarter-end date, and price.
    """
    try:
        price_data = get_stock_price_by_quarter(ticker, quarter)

        if "error" in price_data:
            return APIResponse(
                success=False,
                error=price_data["error"],
                message=f"Failed to get price for {ticker} in {quarter}"
            )

        return APIResponse(
            success=True,
            data=price_data,
            message=f"Price retrieved for {ticker} in {quarter}"
        )
    except Exception as e:
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to get stock price by quarter"
        )


@router.get("/price/change/{ticker}", response_model=APIResponse)
async def get_stock_price_change_endpoint(ticker: str, quarter: str = None):
    """
    Get the percentage change between current price and reported quarter price.

    Args:
        ticker: Stock ticker symbol.
        quarter: Quarter in 'YYYYQN' format (optional, defaults to last quarter).

    Returns:
        Price change information including ticker, current price, reported price,
        percentage change, and price change.
    """
    try:
        price_change = get_stock_price_change(ticker, quarter)

        if "error" in price_change:
            return APIResponse(
                success=False,
                error=price_change["error"],
                message=f"Failed to get price change for {ticker}"
            )

        return APIResponse(
            success=True,
            data=price_change,
            message=f"Price change retrieved for {ticker}"
        )
    except Exception as e:
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to get stock price change"
        )


@router.get("/price/changes", response_model=APIResponse)
async def get_portfolio_price_changes_endpoint(tickers: str, quarter: str = None):
    """
    Get price change data for multiple portfolio stocks in a single request.

    Args:
        tickers: Comma-separated list of stock tickers.
        quarter: Quarter in 'YYYYQN' format (optional, defaults to last quarter).

    Returns:
        List of price change information dictionaries.
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

        price_changes = get_portfolio_price_changes(ticker_list, quarter)

        return APIResponse(
            success=True,
            data=price_changes,
            message=f"Price changes retrieved for {len(price_changes)} stocks"
        )
    except Exception as e:
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to get portfolio price changes"
        )


@router.get("/full-data", response_model=APIResponse)
async def get_portfolio_full_data_endpoint(tickers: str, quarter: str = None):
    """
    Get both recommendation and price change data for multiple portfolio stocks in a single request.

    Args:
        tickers: Comma-separated list of stock tickers.
        quarter: Quarter in 'YYYYQN' format (optional, defaults to last quarter).

    Returns:
        List of dictionaries containing both recommendation and price change data.
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

        full_data = get_portfolio_full_data(ticker_list, quarter)

        return APIResponse(
            success=True,
            data=full_data,
            message=f"Full portfolio data retrieved for {len(full_data)} stocks"
        )
    except Exception as e:
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to get portfolio full data"
        )
