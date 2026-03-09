"""
Filings service for API - wraps non-quarterly filing functions.
"""
from app.utils.database import load_non_quarterly_data, get_all_quarters
from typing import Any
import pandas as pd
from pathlib import Path


class FilingsService:
    """Service for non-quarterly filing operations."""

    @staticmethod
    def _get_13f_holdings_by_ticker(quarter: str) -> dict[str, float]:
        """Get 13F holdings by ticker for a given quarter.

        Args:
            quarter: Quarter in YYYYQN format

        Returns:
            Dictionary mapping ticker to maximum shares held
        """
        ticker_shares = {}
        quarter_dir = Path('./database') / quarter

        if not quarter_dir.is_dir():
            return ticker_shares

        for file_path in quarter_dir.glob('*.csv'):
            try:
                fund_df = pd.read_csv(file_path)
                if not fund_df.empty and 'Ticker' in fund_df.columns and 'Shares' in fund_df.columns:
                    for _, row in fund_df.iterrows():
                        ticker = row.get('Ticker')
                        shares = row.get('Shares', 0)
                        if ticker and pd.notna(shares) and shares > 0:
                            if ticker not in ticker_shares or shares > ticker_shares[ticker]:
                                ticker_shares[ticker] = float(shares)
            except Exception:
                continue

        return ticker_shares

    @staticmethod
    def _calculate_delta(df: pd.DataFrame) -> pd.DataFrame:
        """Calculate delta by comparing against 13F holdings.

        Args:
            df: DataFrame with current non-quarterly filings

        Returns:
            DataFrame with DELTA column added
        """
        if df.empty:
            return df

        df = df.copy()
        df['Shares'] = pd.to_numeric(df['Shares'], errors='coerce').fillna(0)

        latest_quarter = get_all_quarters()[0] if get_all_quarters() else None

        if not latest_quarter:
            df['DELTA'] = 'NEW'
            return df

        ticker_shares_13f = FilingsService._get_13f_holdings_by_ticker(latest_quarter)

        def calculate_delta(row):
            shares_current = row['Shares']
            ticker = row.get('Ticker')
            shares_13f = ticker_shares_13f.get(ticker, 0)

            if shares_13f == 0:
                return 'NEW'
            elif shares_current == 0:
                return 'CLOSE'
            else:
                pct_change = (shares_current - shares_13f) / shares_13f * 100
                return f"{pct_change:+.1f}%"

        df['DELTA'] = df.apply(calculate_delta, axis=1)

        return df

    @staticmethod
    def get_recent_filings(days: int = 30) -> dict[str, Any]:
        """Get recent non-quarterly filings from the last N days.

        Args:
            days (int): Number of days to look back. Defaults to 30.

        Returns:
            dict: Dictionary containing total filings and list of recent filings.
        """
        try:
            df = load_non_quarterly_data()

            if df.empty:
                return {
                    "total_filings": 0,
                    "recent_filings": []
                }

            df['Date'] = pd.to_datetime(df['Date'])
            cutoff_date = pd.Timestamp.now() - pd.Timedelta(days=days)

            recent_filings = df[df['Date'] >= cutoff_date].head(100)

            recent_filings = FilingsService._calculate_delta(recent_filings)

            recent_filings = recent_filings.rename(columns={
                'Fund': 'FUND',
                'CUSIP': 'CUSIP',
                'Ticker': 'TICKER',
                'Company': 'COMPANY',
                'Value': 'VALUE',
                'Avg_Price': 'AVG_PRICE',
                'Date': 'DATE',
                'Filing_Date': 'FILING_DATE',
                'DELTA': 'DELTA'
            })

            return {
                "total_filings": len(recent_filings),
                "recent_filings": recent_filings.to_dict('records')
            }
        except Exception as e:
            return {
                "total_filings": 0,
                "recent_filings": [],
                "error": str(e)
            }

    @staticmethod
    def get_fund_filings(fund_name: str, days: int = 30) -> list[dict[str, Any]]:
        """Get recent filings for a specific fund.

        Args:
            fund_name (str): Name of the fund.
            days (int): Number of days to look back.

        Returns:
            list: List of recent filings for the fund.
        """
        try:
            df = load_non_quarterly_data()

            if df.empty:
                return []

            df['Date'] = pd.to_datetime(df['Date'])
            cutoff_date = pd.Timestamp.now() - pd.Timedelta(days=days)

            fund_filings = df[
                (df['Fund'] == fund_name) &
                (df['Date'] >= cutoff_date)
            ]

            return fund_filings.to_dict('records')
        except Exception as e:
            return []

    @staticmethod
    def get_stock_filings(ticker: str, days: int = 30) -> list[dict[str, Any]]:
        """Get recent filings for a specific stock.

        Args:
            ticker (str): Stock ticker.
            days (int): Number of days to look back.

        Returns:
            list: List of recent filings for the stock.
        """
        try:
            df = load_non_quarterly_data()

            if df.empty:
                return []

            df['Date'] = pd.to_datetime(df['Date'])
            cutoff_date = pd.Timestamp.now() - pd.Timedelta(days=days)

            stock_filings = df[
                (df['Ticker'] == ticker) &
                (df['Date'] >= cutoff_date)
            ]

            return stock_filings.to_dict('records')
        except Exception as e:
            return []

    @staticmethod
    def get_filings_summary(days: int = 30) -> dict[str, Any]:
        """Get summary of recent filings.

        Args:
            days (int): Number of days to look back.

        Returns:
            dict: Summary with counts by filing type and fund.
        """
        try:
            df = load_non_quarterly_data()

            if df.empty:
                return {
                    "total_filings": 0,
                    "by_fund": {},
                    "by_type": {},
                    "by_ticker": {}
                }

            df['Date'] = pd.to_datetime(df['Date'])
            cutoff_date = pd.Timestamp.now() - pd.Timedelta(days=days)

            recent_df = df[df['Date'] >= cutoff_date]

            summary = {
                "total_filings": len(recent_df),
                "by_fund": recent_df['Fund'].value_counts().to_dict(),
                "by_type": recent_df['Type'].value_counts().to_dict(),
                "by_ticker": recent_df['Ticker'].value_counts().to_dict()
            }

            return summary
        except Exception as e:
            return {
                "total_filings": 0,
                "by_fund": {},
                "by_type": {},
                "by_ticker": {},
                "error": str(e)
            }

    @staticmethod
    def get_filings_by_quarter(quarter: str, days: int = 30) -> list[dict[str, Any]]:
        """Get filings for a specific quarter.

        Args:
            quarter (str): Quarter in 'YYYYQN' format.
            days (int): Number of days to look back.

        Returns:
            list: List of filings for the quarter.
        """
        try:
            df = load_non_quarterly_data()

            if df.empty:
                return []

            df['Date'] = pd.to_datetime(df['Date'])

            quarter_start_date = pd.Timestamp(f"{quarter[:4]}-04-01")
            quarter_end_date = pd.Timestamp(f"{quarter[:4]}-06-30")

            quarter_filings = df[
                (df['Date'] >= quarter_start_date) &
                (df['Date'] <= quarter_end_date)
            ]

            return quarter_filings.to_dict('records')
        except Exception as e:
            return []
