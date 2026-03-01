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
import sqlite3
import os


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

    @staticmethod
    def get_price_history(ticker: str, limit: int = 365) -> list[dict[str, Any]]:
        """Get price history for a ticker from the database.

        Args:
            ticker (str): Stock ticker symbol.
            limit (int): Number of days of price history to retrieve (default: 365).

        Returns:
            list: List of price points with date and close price.
        """
        try:
            data_dir = os.path.join(os.getcwd(), 'data')
            db_path = os.path.join(data_dir, 'edgar_cache.db')

            if not os.path.exists(db_path):
                return []

            conn = sqlite3.connect(db_path)
            conn.row_factory = sqlite3.Row

            try:
                query = """
                    SELECT dt, close
                    FROM prices
                    WHERE ticker = ?
                    ORDER BY dt DESC
                    LIMIT ?
                """
                rows = conn.execute(query, (ticker.upper(), limit)).fetchall()

                if not rows:
                    conn.close()
                    return []

                # Convert to list of dictionaries with proper date formatting
                price_history = [
                    {
                        'date': row['dt'],
                        'close': float(row['close'])
                    }
                    for row in rows
                ]

                return price_history
            finally:
                conn.close()
        except Exception as e:
            return []

    @staticmethod
    def _load_sp500_constituents() -> set[str]:
        """Load S&P 500 constituents from CSV file.

        Returns:
            set: Set of S&P 500 ticker symbols.
        """
        try:
            csv_path = os.path.join(os.getcwd(), 'data', 'constituents.csv')
            if not os.path.exists(csv_path):
                return set()

            df = pd.read_csv(csv_path)
            return set(df['Symbol'].unique())
        except Exception as e:
            return set()

    @staticmethod
    def is_sp500_stock(ticker: str) -> bool:
        """Check if a stock ticker is in the S&P 500.

        Args:
            ticker (str): Stock ticker symbol.

        Returns:
            bool: True if the ticker is in S&P 500, False otherwise.
        """
        try:
            sp500 = StockService._load_sp500_constituents()
            return ticker.upper() in sp500
        except Exception:
            return False

    @staticmethod
    def get_fundamentals(ticker: str, quarter: str | None = None) -> dict[str, Any]:
        """Get fundamentals data for a ticker.

        Args:
            ticker (str): Stock ticker symbol.
            quarter (str): Quarter in 'YYYYQN' format. If None, returns latest quarter.

        Returns:
            dict: Fundamentals data with all raw and computed indicators.
        """
        try:
            data_dir = os.path.join(os.getcwd(), 'data')
            db_path = os.path.join(data_dir, 'edgar_cache.db')

            if not os.path.exists(db_path):
                return {"error": "Database not found"}

            conn = sqlite3.connect(db_path)
            conn.row_factory = sqlite3.Row

            try:
                if quarter:
                    query = """
                        SELECT *
                        FROM fundamentals
                        WHERE ticker = ? AND fiscal_quarter = ?
                        LIMIT 1
                    """
                    rows = conn.execute(query, (ticker.upper(), quarter)).fetchall()
                else:
                    query = """
                        SELECT *
                        FROM fundamentals
                        WHERE ticker = ?
                        ORDER BY period_end DESC
                        LIMIT 1
                    """
                    rows = conn.execute(query, (ticker.upper(),)).fetchall()

                if not rows:
                    conn.close()
                    return {"error": f"No data found for {ticker.upper()}"}

                row = rows[0]

                # Convert row to dictionary
                fundamentals = {
                    'ticker': row['ticker'],
                    'fiscal_quarter': row['fiscal_quarter'],
                    'period_end': row['period_end'],
                    # Raw income statement
                    'revenue': float(row['revenue']) if row['revenue'] else None,
                    'gross_profit': float(row['gross_profit']) if row['gross_profit'] else None,
                    'operating_income': float(row['operating_income']) if row['operating_income'] else None,
                    'net_income': float(row['net_income']) if row['net_income'] else None,
                    'interest_expense': float(row['interest_expense']) if row['interest_expense'] else None,
                    'dividends_paid': float(row['dividends_paid']) if row['dividends_paid'] else None,
                    'eps_diluted': float(row['eps_diluted']) if row['eps_diluted'] else None,
                    'ebitda': float(row['ebitda']) if row['ebitda'] else None,
                    # Raw balance sheet
                    'total_assets': float(row['total_assets']) if row['total_assets'] else None,
                    'current_assets': float(row['current_assets']) if row['current_assets'] else None,
                    'cash': float(row['cash']) if row['cash'] else None,
                    'total_liabilities': float(row['total_liabilities']) if row['total_liabilities'] else None,
                    'current_liabilities': float(row['current_liabilities']) if row['current_liabilities'] else None,
                    'long_term_debt': float(row['long_term_debt']) if row['long_term_debt'] else None,
                    'short_term_debt': float(row['short_term_debt']) if row['short_term_debt'] else None,
                    'total_debt': float(row['total_debt']) if row['total_debt'] else None,
                    'equity': float(row['equity']) if row['equity'] else None,
                    'shares_outstanding': float(row['shares_outstanding']) if row['shares_outstanding'] else None,
                    # Raw cash flow
                    'operating_cf': float(row['operating_cf']) if row['operating_cf'] else None,
                    'capex': float(row['capex']) if row['capex'] else None,
                    'free_cash_flow': float(row['free_cash_flow']) if row['free_cash_flow'] else None,
                    # Market data
                    'market_cap': float(row['market_cap']) if row['market_cap'] else None,
                    'analyst_target_price': float(row['analyst_target_price']) if row['analyst_target_price'] else None,
                    'forward_pe': float(row['forward_pe']) if row['forward_pe'] else None,
                    # Computed indicators
                    'revenue_growth_1y': float(row['revenue_growth_1y']) if row['revenue_growth_1y'] else None,
                    'revenue_growth_3y': float(row['revenue_growth_3y']) if row['revenue_growth_3y'] else None,
                    'earnings_growth_1y': float(row['earnings_growth_1y']) if row['earnings_growth_1y'] else None,
                    'fcf_margin': float(row['fcf_margin']) if row['fcf_margin'] else None,
                    'fcf_yield': float(row['fcf_yield']) if row['fcf_yield'] else None,
                    'fcf_positive': float(row['fcf_positive']) if row['fcf_positive'] else None,
                    'fcf_growth_1y': float(row['fcf_growth_1y']) if row['fcf_growth_1y'] else None,
                    'net_debt_to_equity': float(row['net_debt_to_equity']) if row['net_debt_to_equity'] else None,
                    'debt_to_assets': float(row['debt_to_assets']) if row['debt_to_assets'] else None,
                    'short_term_debt_share': float(row['short_term_debt_share']) if row['short_term_debt_share'] else None,
                    'interest_coverage': float(row['interest_coverage']) if row['interest_coverage'] else None,
                    'gross_margin': float(row['gross_margin']) if row['gross_margin'] else None,
                    'operating_margin': float(row['operating_margin']) if row['operating_margin'] else None,
                    'net_margin': float(row['net_margin']) if row['net_margin'] else None,
                    'roe': float(row['roe']) if row['roe'] else None,
                    'roa': float(row['roa']) if row['roa'] else None,
                    'asset_turnover': float(row['asset_turnover']) if row['asset_turnover'] else None,
                    'current_ratio': float(row['current_ratio']) if row['current_ratio'] else None,
                    'cash_ratio': float(row['cash_ratio']) if row['cash_ratio'] else None,
                    'pe_ratio': float(row['pe_ratio']) if row['pe_ratio'] else None,
                    'peg_ratio': float(row['peg_ratio']) if row['peg_ratio'] else None,
                    'ev_to_ebitda': float(row['ev_to_ebitda']) if row['ev_to_ebitda'] else None,
                    'pb_ratio': float(row['pb_ratio']) if row['pb_ratio'] else None,
                    'relative_pb': float(row['relative_pb']) if row['relative_pb'] else None,
                    'analyst_upside': float(row['analyst_upside']) if row['analyst_upside'] else None,
                    'dividend_yield': float(row['dividend_yield']) if row['dividend_yield'] else None,
                    'payout_ratio': float(row['payout_ratio']) if row['payout_ratio'] else None,
                    'price_momentum_12m': float(row['price_momentum_12m']) if row['price_momentum_12m'] else None,
                    'price_momentum_6m': float(row['price_momentum_6m']) if row['price_momentum_6m'] else None,
                    'close_price': float(row['close_price']) if row['close_price'] else None,
                }

                return fundamentals
            finally:
                conn.close()
        except Exception as e:
            return {"error": str(e)}
