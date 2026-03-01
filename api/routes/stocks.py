"""
Stock-related API endpoints.
"""
from fastapi import APIRouter
from api.services.stock_service import StockService
from api.models.api_response import APIResponse

router = APIRouter(prefix="/api/stocks", tags=["stocks"])


@router.get("/search", response_model=APIResponse)
async def search_stocks(query: str):
    """Search stocks by ticker or company name."""
    try:
        stocks = StockService.search_stocks(query)
        return APIResponse(
            success=True,
            data=stocks,
            message=f"Found {len(stocks)} stocks matching '{query}'"
        )
    except Exception as e:
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to search stocks"
        )


@router.get("/{ticker}/holdings/{quarter}", response_model=APIResponse)
async def get_stock_holdings(ticker: str, quarter: str):
    """Get holders for a stock in a specific quarter."""
    try:
        holders = StockService.get_stock_holders(ticker, quarter)
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


@router.get("/{ticker}/analysis/{quarter}", response_model=APIResponse)
async def get_stock_analysis(ticker: str, quarter: str):
    """Get comprehensive stock analysis for a specific quarter."""
    try:
        analysis = StockService.get_stock_analysis(ticker, quarter)
        if "error" in analysis:
            return APIResponse(
                success=False,
                error=analysis["error"],
                message="Stock analysis failed"
            )

        return APIResponse(
            success=True,
            data=analysis,
            message=f"Analysis for {ticker} in {quarter}"
        )
    except Exception as e:
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to retrieve stock analysis"
        )


@router.get("/all", response_model=APIResponse)
async def get_all_stocks():
    """Get all available stocks from the database."""
    try:
        stocks = StockService.load_stocks()
        if stocks.empty:
            return APIResponse(
                success=False,
                error="No stocks found in database",
                message="No data available"
            )
        stocks_list = stocks.to_dict('records')
        return APIResponse(
            success=True,
            data=stocks_list,
            message=f"Retrieved {len(stocks_list)} stocks"
        )
    except Exception as e:
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to retrieve stocks"
        )


@router.get("/{ticker}/price-history", response_model=APIResponse)
async def get_stock_price_history(ticker: str, limit: int = 365):
    """Get price history for a stock ticker."""
    try:
        price_history = StockService.get_price_history(ticker.upper(), limit)

        if not price_history:
            return APIResponse(
                success=False,
                error=f"No price history found for {ticker.upper()}",
                message="No data available"
            )

        return APIResponse(
            success=True,
            data=price_history,
            message=f"Retrieved {len(price_history)} price points for {ticker.upper()}"
        )
    except Exception as e:
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to retrieve price history"
        )


@router.get("/{ticker}/fundamentals", response_model=APIResponse)
async def get_stock_fundamentals(ticker: str, quarter: str | None = None):
    """Get fundamentals data for a stock."""
    try:
        fundamentals = StockService.get_fundamentals(ticker.upper(), quarter)

        if "error" in fundamentals:
            return APIResponse(
                success=False,
                error=fundamentals["error"],
                message="No data available"
            )

        return APIResponse(
            success=True,
            data=fundamentals,
            message=f"Retrieved fundamentals for {ticker.upper()}"
        )
    except Exception as e:
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to retrieve fundamentals"
        )


@router.get("/{ticker}/is-sp500-stock", response_model=APIResponse)
async def get_stock_sp500_status(ticker: str):
    """Check if a stock ticker is in the S&P 500."""
    try:
        is_sp500 = StockService.is_sp500_stock(ticker.upper())
        return APIResponse(
            success=True,
            data=is_sp500,
            message=f"{ticker.upper()} is in S&P 500: {is_sp500}"
        )
    except Exception as e:
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to check S&P 500 status"
        )
