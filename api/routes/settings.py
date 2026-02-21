"""
Settings API endpoints.
"""
import logging
import pandas as pd
from fastapi import APIRouter, HTTPException
from typing import Any
from pathlib import Path
import csv

from api.services.settings_service import SettingsService
from api.models.api_response import APIResponse

router = APIRouter(prefix="/api/settings", tags=["settings"])
logger = logging.getLogger(__name__)


@router.get("/data-sources", response_model=APIResponse)
async def get_data_sources():
    """Get information about all data sources and their status."""
    try:
        logger.info("Getting data sources information")
        data_sources = SettingsService.get_all_data_sources()
        return APIResponse(
            success=True,
            data=data_sources,
            message="Retrieved data sources information"
        )
    except Exception as e:
        logger.error(f"Failed to get data sources: {e}", exc_info=True)
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to retrieve data sources"
        )


@router.get("/stocks", response_model=APIResponse)
async def get_all_stocks(limit: int = 100):
    """Get all stocks from the database."""
    try:
        logger.info(f"Getting all stocks (limit: {limit})")
        stocks = SettingsService.get_all_stocks()

        # Apply limit for performance
        if len(stocks) > limit:
            stocks = stocks[:limit]

        return APIResponse(
            success=True,
            data=stocks,
            message=f"Retrieved {len(stocks)} stocks"
        )
    except Exception as e:
        logger.error(f"Failed to get stocks: {e}", exc_info=True)
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to retrieve stocks"
        )


@router.get("/stocks/search", response_model=APIResponse)
async def search_stocks(query: str, search_field: str = "ticker"):
    """Search stocks by ticker or CUSIP."""
    try:
        if not query:
            return APIResponse(
                success=False,
                error="Query parameter is required",
                message="Missing required parameter: query"
            )

        if search_field == "ticker":
            stock = SettingsService.get_stock_by_ticker(query.upper())
        elif search_field == "cusip":
            stock = SettingsService.get_stock_by_cusip(query.upper())
        else:
            return APIResponse(
                success=False,
                error="Invalid search field",
                message="Valid search fields are: ticker, cusip"
            )

        if stock:
            return APIResponse(
                success=True,
                data=stock,
                message=f"Found stock: {stock['Ticker']}"
            )
        else:
            return APIResponse(
                success=False,
                error="Stock not found",
                message=f"No stock found matching '{query}'"
            )
    except Exception as e:
        logger.error(f"Failed to search stocks: {e}", exc_info=True)
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to search stocks"
        )


@router.get("/stocks/{ticker}", response_model=APIResponse)
async def get_stock_by_ticker_route(ticker: str):
    """Get a specific stock by ticker."""
    try:
        logger.info(f"Getting stock by ticker: {ticker}")
        stock = SettingsService.get_stock_by_ticker(ticker.upper())

        if stock:
            return APIResponse(
                success=True,
                data=stock,
                message=f"Retrieved stock: {stock['Ticker']}"
            )
        else:
            return APIResponse(
                success=False,
                error="Stock not found",
                message=f"No stock found with ticker: {ticker}"
            )
    except Exception as e:
        logger.error(f"Failed to get stock: {e}", exc_info=True)
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to retrieve stock"
        )


@router.get("/stocks/{cusip}", response_model=APIResponse)
async def get_stock_by_cusip_route(cusip: str):
    """Get a specific stock by CUSIP."""
    try:
        logger.info(f"Getting stock by CUSIP: {cusip}")
        stock = SettingsService.get_stock_by_cusip(cusip.upper())

        if stock:
            return APIResponse(
                success=True,
                data=stock,
                message=f"Retrieved stock: {stock['Ticker']}"
            )
        else:
            return APIResponse(
                success=False,
                error="Stock not found",
                message=f"No stock found with CUSIP: {cusip}"
            )
    except Exception as e:
        logger.error(f"Failed to get stock: {e}", exc_info=True)
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to retrieve stock"
        )


@router.get("/hedge-funds", response_model=APIResponse)
async def get_all_hedge_funds():
    """Get all tracked hedge funds."""
    try:
        logger.info("Getting all hedge funds")
        funds = SettingsService.get_all_hedge_funds()
        return APIResponse(
            success=True,
            data=funds,
            message=f"Retrieved {len(funds)} funds"
        )
    except Exception as e:
        logger.error(f"Failed to get hedge funds: {e}", exc_info=True)
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to retrieve hedge funds"
        )


@router.get("/hedge-funds/excluded", response_model=APIResponse)
async def get_excluded_hedge_funds():
    """Get all excluded hedge funds."""
    try:
        logger.info("Getting all excluded hedge funds")
        funds = SettingsService.get_excluded_hedge_funds()
        return APIResponse(
            success=True,
            data=funds,
            message=f"Retrieved {len(funds)} excluded funds"
        )
    except Exception as e:
        logger.error(f"Failed to get excluded hedge funds: {e}", exc_info=True)
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to retrieve excluded hedge funds"
        )


@router.get("/hedge-funds/{cik}", response_model=APIResponse)
async def get_hedge_fund_by_cik(cik: str):
    """Get a specific hedge fund by CIK."""
    try:
        logger.info(f"Getting hedge fund by CIK: {cik}")
        funds = SettingsService.get_all_hedge_funds()
        fund = [f for f in funds if f['CIK'] == cik.upper()]

        if fund:
            return APIResponse(
                success=True,
                data=fund[0],
                message=f"Retrieved fund: {fund[0]['Fund']}"
            )
        else:
            return APIResponse(
                success=False,
                error="Fund not found",
                message=f"No fund found with CIK: {cik}"
            )
    except Exception as e:
        logger.error(f"Failed to get hedge fund: {e}", exc_info=True)
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to retrieve hedge fund"
        )


@router.get("/models", response_model=APIResponse)
async def get_all_models():
    """Get all AI models."""
    try:
        logger.info("Getting all AI models")
        models = SettingsService.get_all_models()
        return APIResponse(
            success=True,
            data=models,
            message=f"Retrieved {len(models)} models"
        )
    except Exception as e:
        logger.error(f"Failed to get models: {e}", exc_info=True)
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to retrieve models"
        )


@router.get("/models/{model_id}", response_model=APIResponse)
async def get_model_by_id_route(model_id: str):
    """Get a specific AI model by ID."""
    try:
        logger.info(f"Getting model by ID: {model_id}")
        model = SettingsService.get_model_by_id(model_id)

        if model:
            # Remove client object for serialization
            model.pop('Client', None)
            return APIResponse(
                success=True,
                data=model,
                message=f"Retrieved model: {model_id}"
            )
        else:
            return APIResponse(
                success=False,
                error="Model not found",
                message=f"No model found with ID: {model_id}"
            )
    except Exception as e:
        logger.error(f"Failed to get model: {e}", exc_info=True)
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to retrieve model"
        )


@router.get("/non-quarterly", response_model=APIResponse)
async def get_non_quarterly_filings():
    """Get the latest non-quarterly filings."""
    try:
        logger.info("Getting non-quarterly filings")
        filings = SettingsService.get_non_quarterly_filings()

        if filings.empty:
            return APIResponse(
                success=False,
                error="No filings found",
                message="No non-quarterly filings available"
            )

        filings_list = filings.to_dict('records')
        return APIResponse(
            success=True,
            data=filings_list,
            message=f"Retrieved {len(filings_list)} filings"
        )
    except Exception as e:
        logger.error(f"Failed to get non-quarterly filings: {e}", exc_info=True)
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to retrieve non-quarterly filings"
        )


@router.get("/summary", response_model=APIResponse)
async def get_settings_summary():
    """Get a comprehensive summary of all settings data."""
    try:
        logger.info("Getting settings summary")
        summary = SettingsService.get_all_data_sources()

        # Add additional information
        summary['stocks_total'] = len(SettingsService.get_all_stocks())
        summary['hedge_funds_total'] = len(SettingsService.get_all_hedge_funds())
        summary['excluded_funds_total'] = len(SettingsService.get_excluded_hedge_funds())
        summary['models_total'] = len(SettingsService.get_all_models())

        return APIResponse(
            success=True,
            data=summary,
            message="Retrieved settings summary"
        )
    except Exception as e:
        logger.error(f"Failed to get settings summary: {e}", exc_info=True)
        return APIResponse(
            success=False,
            error=str(e),
            message="Failed to retrieve settings summary"
        )
