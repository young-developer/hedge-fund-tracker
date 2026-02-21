"""
Settings service for API - wraps database functions for configuration management.
"""
from typing import Any
import logging
import pandas as pd

logger = logging.getLogger(__name__)


class SettingsService:
    """Service for settings-related database operations."""

    @staticmethod
    def get_all_stocks() -> list[dict[str, Any]]:
        """
        Get all stocks from the database.

        Returns:
            list: List of stock information dictionaries.
        """
        from app.utils.database import load_all_stocks

        try:
            logger.info("Loading all stocks from database")
            stocks = load_all_stocks()

            if stocks.empty:
                logger.warning("No stocks found in database")
                return []

            stocks_list = stocks.to_dict('records')
            logger.info(f"Successfully loaded {len(stocks_list)} stocks")
            return stocks_list
        except Exception as e:
            logger.error(f"Failed to load stocks: {e}", exc_info=True)
            return []

    @staticmethod
    def get_stock_by_cusip(cusip: str) -> dict[str, Any] | None:
        """
        Get a specific stock by CUSIP.

        Args:
            cusip (str): The CUSIP to search for.

        Returns:
            dict | None: Stock information dictionary or None if not found.
        """
        from app.utils.database import get_stock_by_cusip

        try:
            logger.info(f"Searching for stock by CUSIP: {cusip}")
            stock = get_stock_by_cusip(cusip)
            return stock
        except Exception as e:
            logger.error(f"Failed to get stock by CUSIP: {e}", exc_info=True)
            return None

    @staticmethod
    def get_stock_by_ticker(ticker: str) -> dict[str, Any] | None:
        """
        Get a specific stock by ticker.

        Args:
            ticker (str): The ticker to search for.

        Returns:
            dict | None: Stock information dictionary or None if not found.
        """
        from app.utils.database import get_stock_by_ticker

        try:
            logger.info(f"Searching for stock by ticker: {ticker}")
            stock = get_stock_by_ticker(ticker)
            return stock
        except Exception as e:
            logger.error(f"Failed to get stock by ticker: {e}", exc_info=True)
            return None

    @staticmethod
    def get_all_hedge_funds() -> list[dict[str, Any]]:
        """
        Get all tracked hedge funds.

        Returns:
            list: List of fund information dictionaries.
        """
        from app.utils.database import load_hedge_funds

        try:
            logger.info("Loading all hedge funds")
            funds = load_hedge_funds()
            logger.info(f"Successfully loaded {len(funds)} funds")
            return funds
        except Exception as e:
            logger.error(f"Failed to load hedge funds: {e}", exc_info=True)
            return []

    @staticmethod
    def get_excluded_hedge_funds() -> list[dict[str, Any]]:
        """
        Get all excluded hedge funds.

        Returns:
            list: List of excluded fund information dictionaries.
        """
        from app.utils.database import get_excluded_hedge_funds

        try:
            logger.info("Loading all excluded hedge funds")
            funds = get_excluded_hedge_funds()
            logger.info(f"Successfully loaded {len(funds)} excluded funds")
            return funds
        except Exception as e:
            logger.error(f"Failed to load excluded hedge funds: {e}", exc_info=True)
            return []

    @staticmethod
    def get_model_by_id(model_id: str) -> dict[str, Any] | None:
        """
        Get a specific AI model by ID.

        Args:
            model_id (str): The model ID to search for.

        Returns:
            dict | None: Model information dictionary or None if not found.
        """
        from app.utils.database import get_model_by_id

        try:
            logger.info(f"Searching for model by ID: {model_id}")
            model = get_model_by_id(model_id)
            return model
        except Exception as e:
            logger.error(f"Failed to get model by ID: {e}", exc_info=True)
            return None

    @staticmethod
    def get_all_models() -> list[dict[str, Any]]:
        """
        Get all AI models.

        Returns:
            list: List of AI model information dictionaries.
        """
        from app.utils.database import load_models

        try:
            logger.info("Loading all AI models")
            models = load_models()

            if not models:
                logger.warning("No models found in database")
                return []

            # Remove client objects that can't be serialized
            for model in models:
                model.pop('Client', None)

            logger.info(f"Successfully loaded {len(models)} models")
            return models
        except Exception as e:
            logger.error(f"Failed to load models: {e}", exc_info=True)
            return []

    @staticmethod
    def get_non_quarterly_filings() -> pd.DataFrame:
        """
        Get the latest non-quarterly filings.

        Returns:
            pd.DataFrame: DataFrame with non-quarterly filings data.
        """
        from app.utils.database import load_non_quarterly_data

        try:
            logger.info("Loading non-quarterly filings")
            filings = load_non_quarterly_data()
            logger.info(f"Successfully loaded {len(filings)} filings")
            return filings
        except Exception as e:
            logger.error(f"Failed to load non-quarterly filings: {e}", exc_info=True)
            return pd.DataFrame()

    @staticmethod
    def get_all_data_sources() -> dict[str, Any]:
        """
        Get all available data sources and their status.

        Returns:
            dict: Dictionary containing information about all data sources.
        """
        try:
            data_sources = {
                'stocks': {
                    'count': len(SettingsService.get_all_stocks()),
                    'description': 'Master stock database'
                },
                'hedge_funds': {
                    'count': len(SettingsService.get_all_hedge_funds()),
                    'description': 'Active hedge funds to track'
                },
                'excluded_hedge_funds': {
                    'count': len(SettingsService.get_excluded_hedge_funds()),
                    'description': 'Excluded hedge funds list'
                },
                'models': {
                    'count': len(SettingsService.get_all_models()),
                    'description': 'AI model configurations'
                },
                'non_quarterly': {
                    'count': len(SettingsService.get_non_quarterly_filings()),
                    'description': 'Latest 13D/G and Form 4 filings'
                }
            }

            logger.info("Data sources information retrieved")
            return data_sources
        except Exception as e:
            logger.error(f"Failed to get data sources: {e}", exc_info=True)
            return {}
