"""
Analysis service for API - wraps quarterly analysis functions.
"""
from app.analysis.stocks import quarter_analysis
from app.utils.database import get_all_quarters, get_last_quarter
from typing import Any, Dict


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
            dict: Quarter analysis with all 5 sections.
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

            top_buys = df.sort_values(by='Total_Delta_Value', ascending=False).head(15)
            top_new_consensus = df.sort_values(by='New_Holder_Count', ascending=False).head(15)
            top_increasing_positions = df[df['Delta'] > 0].sort_values(by='Delta', ascending=False).head(15)
            top_bets = df.sort_values(by='Net_Buyers', ascending=False).head(15)
            average_portfolio = df.sort_values(by='Max_Portfolio_Pct', ascending=False).head(15)[['Ticker', 'Company', 'Avg_Portfolio_Pct', 'Max_Portfolio_Pct', 'Holder_Count', 'Delta']]

            return {
                'QUARTER': quarter,
                'TOTAL_STOCKS': len(df),
                'TOP_BUYS': top_buys.to_dict('records'),
                'TOP_NEW_CONSENSUS': top_new_consensus.to_dict('records'),
                'TOP_INCREASING_POSITIONS': top_increasing_positions.to_dict('records'),
                'TOP_BETS': top_bets.to_dict('records'),
                'AVERAGE_PORTFOLIO': average_portfolio.to_dict('records')
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
