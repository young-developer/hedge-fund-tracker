"""
Stock service for API - wraps analysis functions for stocks.
"""
from app.analysis.stocks import (
    get_quarter_data,
    stock_analysis,
    fund_analysis,
    quarter_analysis
)
from app.utils.database import load_stocks, find_cusips_for_ticker
from typing import Any
import pandas as pd
import numpy as np
from datetime import datetime


def convert_numpy_types(obj: Any) -> Any:
    """Convert numpy types to Python native types for JSON serialization."""
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    return obj


class StockService:
    """Service for stock-related analysis operations."""

    @staticmethod
    def search_stocks(query: str) -> list[dict[str, Any]]:
        """Search stocks by ticker or company name.

        Args:
            query (str): Search query (ticker or company name).

        Returns:
            list: List of matching stock information.
        """
        try:
            stocks_df = load_stocks()
            query_lower = query.lower()

            matches = stocks_df[
                stocks_df['Ticker'].str.lower().str.contains(query_lower, na=False) |
                stocks_df['Company'].str.lower().str.contains(query_lower, na=False)
            ]

            # Reset index to get CUSIP as a column
            matches_reset = matches.reset_index()
            return matches_reset[['CUSIP', 'Ticker', 'Company']].to_dict('records')
        except Exception as e:
            return []

    @staticmethod
    def get_stock_holders(ticker: str, quarter: str) -> pd.DataFrame:
        """Get holders for a stock in a specific quarter.

        Args:
            ticker (str): Stock ticker.
            quarter (str): Quarter in 'YYYYQN' format.

        Returns:
            pd.DataFrame: DataFrame with fund-level holdings for the stock.
        """
        try:
            df = stock_analysis(ticker, quarter)

            if df.empty:
                return pd.DataFrame()

            df = df.rename(columns={
                'Fund': 'FUND',
                'Ticker': 'TICKER',
                'Company': 'COMPANY',
                'Value': 'VALUE',
                'Delta_Shares': 'DELTA_SHARES',
                'Delta_Value': 'DELTA_VALUE',
                'Portfolio_Pct': 'PORTFOLIO_PCT',
                'Delta': 'DELTA'
            })

            return df
        except Exception as e:
            return pd.DataFrame()

    @staticmethod
    def get_stock_analysis(ticker: str, quarter: str) -> dict[str, Any]:
        """Get comprehensive stock analysis for a specific quarter.

        Args:
            ticker (str): Stock ticker.
            quarter (str): Quarter in 'YYYYQN' format.

        Returns:
            dict: Stock analysis with holders, delta, etc.
        """
        try:
            df_analysis = stock_analysis(ticker, quarter)

            if df_analysis.empty:
                return {"error": f"No data found for {ticker} in {quarter}"}

            df_analysis = df_analysis.rename(columns={
                'Fund': 'FUND',
                'Ticker': 'TICKER',
                'Company': 'COMPANY',
                'Value': 'VALUE',
                'Delta_Shares': 'DELTA_SHARES',
                'Delta_Value': 'DELTA_VALUE',
                'Portfolio_Pct': 'PORTFOLIO_PCT',
                'Delta': 'DELTA'
            })

            total_value = df_analysis['VALUE'].sum()
            total_delta_value = df_analysis['DELTA_VALUE'].sum()
            avg_percentage = df_analysis['PORTFOLIO_PCT'].mean()
            max_percentage = df_analysis['PORTFOLIO_PCT'].max()
            num_buyers = (df_analysis['DELTA_VALUE'] > 0).sum()
            num_sellers = (df_analysis['DELTA_VALUE'] < 0).sum()
            holder_count = (df_analysis['DELTA'] != 'CLOSE').sum()
            new_holder_count = (
                df_analysis['DELTA'].str.startswith('NEW')).sum()
            close_count = (df_analysis['DELTA'] == 'CLOSE').sum()
            previous_total_value = total_value - total_delta_value
            delta = total_delta_value / previous_total_value * 100 if previous_total_value != 0 else np.nan

            analysis = {
                'TICKER': ticker.upper(),
                'COMPANY': df_analysis['COMPANY'].iloc[0],
                'TOTAL_VALUE': float(total_value),
                'TOTAL_DELTA_VALUE': float(total_delta_value),
                'DELTA_PCT': {"NEW" if holder_count == new_holder_count and close_count == 0 else delta},
                'AVG_PERCENTAGE': float(avg_percentage),
                'MAX_PERCENTAGE': float(max_percentage),
                'HOLDER_COUNT': holder_count,
                'NUM_BUYERS': int(num_buyers),
                'NUM_SELLERS': int(num_sellers),
                'NEW_HOLDER_COUNT': int(new_holder_count),
                'CLOSE_COUNT': int(close_count),
            }

            return convert_numpy_types(analysis)
        except Exception as e:
            return {"error": str(e)}

    @staticmethod
    def get_stock_quarter_data(ticker: str, quarter: str) -> pd.DataFrame:
        """Get raw quarter data for a specific stock.

        Args:
            ticker (str): Stock ticker.
            quarter (str): Quarter in 'YYYYQN' format.

        Returns:
            pd.DataFrame: Raw quarter data for the stock.
        """
        try:
            df = get_quarter_data(quarter)
            df = df[df['TICKER'] == ticker]
            df = df.rename(columns={
                'Ticker': 'TICKER',
                'Company': 'COMPANY',
                'Value': 'VALUE',
                'Delta_Shares': 'DELTA_SHARES',
                'Delta_Value': 'DELTA_VALUE',
                'Portfolio%': 'PORTFOLIO%',
                'Delta': 'DELTA'
            })
            return df
        except Exception as e:
            return pd.DataFrame()

    @staticmethod
    def get_stock_cusips(ticker: str) -> list[dict[str, str]]:
        """Find all CUSIPs for a given ticker.

        Args:
            ticker (str): Stock ticker.

        Returns:
            list: List of CUSIP information dictionaries.
        """
        try:
            cusips = find_cusips_for_ticker(ticker)
            return [{'CUSIP': c['CUSIP'], 'TICKER': c['TICKER'], 'COMPANY': c['COMPANY']} for c in cusips]
        except Exception as e:
            return []

    @staticmethod
    def get_top_stocks_by_quarter(quarter: str, limit: int = 20) -> list[dict[str, Any]]:
        """Get top stocks for a quarter based on analysis.

        Args:
            quarter (str): Quarter in 'YYYYQN' format.
            limit (int): Number of top stocks to return.

        Returns:
            list: Top stocks with analysis data.
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

            top_stocks = df.sort_values(by='TOTAL_DELTA_VALUE', ascending=False).head(limit)

            return top_stocks.to_dict('records')
        except Exception as e:
            return []

    @staticmethod
    def load_stocks() -> pd.DataFrame:
        """Load all stocks from the database.

        Returns:
            pd.DataFrame: DataFrame containing all stock information.
        """
        try:
            return load_stocks()
        except Exception as e:
            return pd.DataFrame()

    @staticmethod
    def get_rising_stocks(quarter: str, limit: int = 20) -> list[dict[str, Any]]:
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
    def get_quarter_analysis(quarter: str) -> dict[str, Any]:
        """Get comprehensive quarter analysis.

        Args:
            quarter (str): Quarter in 'YYYYQN' format.

        Returns:
            dict: Quarter analysis with top buys, rising, and top bets.
        """
        try:
            df = quarter_analysis(quarter)

            if df.empty:
                return {"error": f"No data available for {quarter}"}

            df = df.rename(columns={
                'Ticker': 'TICKER',
                'Company': 'COMPANY',
                'Total_Delta_Value': 'TOTAL_DELTA_VALUE',
                'Delta': 'DELTA',
                'Net_Buyers': 'NET_BUYERS'
            })

            top_buys = df.sort_values(by='TOTAL_DELTA_VALUE', ascending=False).head(20)
            top_rising = df[df['DELTA'] > 0].sort_values(by='DELTA', ascending=False).head(20)
            top_bets = df.sort_values(by='NET_BUYERS', ascending=False).head(20)

            return {
                'QUARTER': quarter,
                'TOTAL_FUNDS': len(set(df['Fund'])),
                'TOTAL_STOCKS': len(df),
                'TOP_BUYS': top_buys.to_dict('records'),
                'TOP_RISING': top_rising.to_dict('records'),
                'TOP_BETS': top_bets.to_dict('records')
            }
        except Exception as e:
            return {"error": str(e)}
