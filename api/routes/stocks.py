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
