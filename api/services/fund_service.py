"""
Fund service for API - wraps database functions for hedge funds.
"""
from app.utils.database import (
    load_hedge_funds,
    load_fund_holdings,
    get_quarters_for_fund,
    get_most_recent_quarter,
    get_all_quarters,
    load_fund_data,
    get_last_quarter
)
from typing import Any
import pandas as pd


class FundService:
    """Service for fund-related database operations."""

    @staticmethod
    def get_all_funds() -> list[dict[str, Any]]:
        """Get all tracked hedge funds.

        Returns:
            list: List of fund information dictionaries.
        """
        return load_hedge_funds()

    @staticmethod
    def get_fund_holdings(fund_name: str, quarter: str) -> pd.DataFrame:
        """Get fund holdings for a specific quarter.

        Args:
            fund_name (str): Name of the fund.
            quarter (str): Quarter in 'YYYYQN' format.

        Returns:
            pd.DataFrame: DataFrame with fund holdings data.
        """
        return load_fund_holdings(fund_name, quarter)

    @staticmethod
    def get_fund_quarters(fund_name: str) -> list[str]:
        """Get all quarters for a specific fund.

        Args:
            fund_name (str): Name of the fund.

        Returns:
            list: List of available quarters.
        """
        return get_quarters_for_fund(fund_name)

    @staticmethod
    def get_fund_performance(fund_name: str, quarter: str) -> dict[str, Any]:
        """Get fund performance evaluation for a specific quarter.

        Args:
            fund_name (str): Name of the fund.
            quarter (str): Quarter in 'YYYYQN' format.

        Returns:
            dict: Performance evaluation with portfolio return, contributors, etc.
        """
        from app.analysis.performance_evaluator import PerformanceEvaluator

        try:
            performance = PerformanceEvaluator.calculate_quarterly_performance(fund_name, quarter)
            return performance
        except Exception as e:
            return {"error": str(e)}

    @staticmethod
    def get_fund_quarters_summary(quarter: str) -> list[dict[str, Any]]:
        """Get all funds for a specific quarter.

        Args:
            quarter (str): Quarter in 'YYYYQN' format.

        Returns:
            list: List of funds with their holdings summary for the quarter.
        """
        try:
            quarters_summary = []
            funds = FundService.get_all_funds()

            for fund in funds:
                fund_name = fund['Fund']
                quarters = FundService.get_fund_quarters(fund_name)

                if quarter in quarters:
                    holdings = FundService.get_fund_holdings(fund_name, quarter)
                    if not holdings.empty:
                        quarters_summary.append({
                            'FUND': fund_name,
                            'MANAGER': fund.get('Manager', ''),
                            'DENOMINATION': fund.get('Denomination', ''),
                            'HOLDINGS_COUNT': len(holdings),
                            'TOTAL_VALUE': holdings['VALUE'].sum()
                        })

            return quarters_summary
        except Exception as e:
            return []

    @staticmethod
    def get_fund_last_quarter(fund_name: str) -> str | None:
        """Get the most recent quarter for a fund.

        Args:
            fund_name (str): Name of the fund.

        Returns:
            str | None: Most recent quarter or None if no data.
        """
        return get_most_recent_quarter(fund_name)

    @staticmethod
    def get_all_available_quarters() -> list[str]:
        """Get all available quarters in the database.

        Returns:
            list: Sorted list of all quarters in descending order.
        """
        return get_all_quarters()

    @staticmethod
    def get_fund_data(fund: str, quarter: str) -> pd.DataFrame:
        """Load raw 13F data for a specific fund and quarter.

        Args:
            fund (str): Name of the fund.
            quarter (str): Quarter in 'YYYYQN' format.

        Returns:
            pd.DataFrame: Raw fund data.
        """
        return load_fund_data(fund, quarter)
