"""
Analysis service for API - wraps quarterly analysis functions.
"""
from app.analysis.stocks import quarter_analysis
from app.utils.database import get_all_quarters, get_last_quarter, \
    count_funds_in_quarter
from typing import Any, Dict
import numpy as np


class AnalysisService:
    """Service for analysis-related operations."""

    @staticmethod
    def get_all_quarters() -> list[str]:
        """Get all available quarters.

        Returns:
            list: Sorted list of all quarters in descending order.
        """
        return get_all_quarters()

    @staticmethod
    def get_quarter_analysis(quarter: str) -> dict[str, Any]:
        """Get comprehensive quarter analysis with all sections.

        Args:
            quarter (str): Quarter in 'YYYYQN' format.

        Returns:
            dict: Quarter analysis with all 5 sections matching print output.
        """
        try:
            df = quarter_analysis(quarter)

            if df.empty:
                return {
                    'error': f"No data available for {quarter}",
                    'QUARTER': quarter,
                    'TOTAL_STOCKS': 0,
                    'TOP_BUYS': [],
                    'TOP_NEW_CONSENSUS': [],
                    'TOP_INCREASING_POSITIONS': [],
                    'TOP_BETS': [],
                    'AVERAGE_PORTFOLIO': []
                }
            top_n = 15
            min_holder_threshold = round(count_funds_in_quarter(quarter) / 10)

            top_buys = df.sort_values(by=['Net_Buyers', 'Buyer_Count', 'Total_Delta_Value'], ascending=False).head(top_n)
            top_new_consensus = df.sort_values(by=['New_Holder_Count', 'Total_Delta_Value'], ascending=False).head(top_n)
            top_increasing_positions = df[(df['Delta'] != np.inf) & (df['Holder_Count'] >= min_holder_threshold)].sort_values(by='Delta', ascending=False).head(top_n)
            top_bets = df.sort_values(by='Max_Portfolio_Pct', ascending=False).head(top_n)
            average_portfolio = df[df['Holder_Count'] >= min_holder_threshold].sort_values(by='Avg_Portfolio_Pct', ascending=False).head(top_n)
            top_sells = df.sort_values(by=['Net_Buyers', 'Seller_Count', 'Total_Delta_Value'], ascending=True).head(top_n)

            return {
                'QUARTER': quarter,
                'TOTAL_STOCKS': len(df),
                'TOP_BUYS': top_buys.to_dict('records'),
                'TOP_NEW_CONSENSUS': top_new_consensus.to_dict('records'),
                'TOP_INCREASING_POSITIONS': top_increasing_positions.to_dict('records'),
                'TOP_BETS': top_bets.to_dict('records'),
                'AVERAGE_PORTFOLIO': average_portfolio.to_dict('records'),
                'TOP_SELLS': top_sells.to_dict('records')
            }
        except Exception as e:
            return {"error": str(e)}

    @staticmethod
    def get_top_buys(quarter: str, limit: int = 20) -> list[dict[str, Any]]:
        """Get top buying stocks for a quarter.

        Args:
            quarter (str): Quarter in 'YYYYQN' format.
            limit (int): Number of top buys to return.

        Returns:
            list: Top buying stocks with analysis data.
        """
        try:
            df = quarter_analysis(quarter)

            if df.empty:
                return []

            df = df.rename(columns={
                'Ticker': 'TICKER',
                'Company': 'COMPANY',
                'Total_Delta_Value': 'TOTAL_DELTA_VALUE',
                'Delta': 'DELTA',
                'Net_Buyers': 'NET_BUYERS'
            })

            top_buys = df.sort_values(by='TOTAL_DELTA_VALUE', ascending=False).head(limit)

            return top_buys.to_dict('records')
        except Exception as e:
            return []

    @staticmethod
    def get_top_rising(quarter: str, limit: int = 20) -> list[dict[str, Any]]:
        """Get rising stocks for a quarter (positive delta).

        Args:
            quarter (str): Quarter in 'YYYYQN' format.
            limit (int): Number of rising stocks to return.

        Returns:
            list: Rising stocks with analysis data.
        """
        try:
            df = quarter_analysis(quarter)

            if df.empty:
                return []

            df = df.rename(columns={
                'Ticker': 'TICKER',
                'Company': 'COMPANY',
                'Total_Delta_Value': 'TOTAL_DELTA_VALUE',
                'Delta': 'DELTA'
            })

            rising_stocks = df[df['DELTA'] > 0].sort_values(by='DELTA', ascending=False).head(limit)

            return rising_stocks.to_dict('records')
        except Exception as e:
            return []

    @staticmethod
    def get_top_bets(quarter: str, limit: int = 20) -> list[dict[str, Any]]:
        """Get top bets for a quarter (highest net buyers).

        Args:
            quarter (str): Quarter in 'YYYYQN' format.
            limit (int): Number of top bets to return.

        Returns:
            list: Top bet stocks with analysis data.
        """
        try:
            df = quarter_analysis(quarter)

            if df.empty:
                return []

            df = df.rename(columns={
                'Ticker': 'TICKER',
                'Company': 'COMPANY',
                'Total_Delta_Value': 'TOTAL_DELTA_VALUE',
                'Delta': 'DELTA',
                'Net_Buyers': 'NET_BUYERS'
            })

            top_bets = df.sort_values(by='NET_BUYERS', ascending=False).head(limit)

            return top_bets.to_dict('records')
        except Exception as e:
            return []

    @staticmethod
    def get_last_quarter() -> str | None:
        """Get the most recent quarter.

        Returns:
            str | None: Most recent quarter or None if no data.
        """
        return get_last_quarter()

    @staticmethod
    def get_all_available_quarters() -> list[str]:
        """Get all available quarters.

        Returns:
            list: All available quarters.
        """
        return get_all_quarters()
