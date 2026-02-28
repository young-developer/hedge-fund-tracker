"""
Portfolio service for API - provides portfolio management and stock recommendations.
"""
from app.analysis.stocks import get_quarter_data, _aggregate_stock_data, _calculate_derived_metrics, aggregate_quarter_by_fund
from app.utils.database import load_stocks, get_last_quarter
from app.utils.strings import get_quarter_date
from app.stocks.price_fetcher import PriceFetcher
from api.utils.cache import cached
from typing import Any
import pandas as pd
import numpy as np
from datetime import datetime, date

def calculate_recommendation_score(df_analysis: pd.DataFrame, price_change_pct: float | None = None) -> dict[str, Any]:
    """
    Calculates a BUY/SELL/HOLD recommendation based on institutional activity and stock price change.

    Args:
        df_analysis (pd.DataFrame): Stock analysis DataFrame with aggregated fund data.
        price_change_pct (float, optional): Percentage change in stock price. Defaults to None.

    Returns:
        dict: Recommendation with label and reasoning.
    """
    if df_analysis.empty or len(df_analysis) == 0:
        return {
            'label': 'N/A',
            'confidence': 0,
            'reasoning': 'No data available'
        }

    row = df_analysis.iloc[0]

    total_value = row.get('Total_Value', 0)
    delta_value = row.get('Total_Delta_Value', 0)
    net_buyers = row.get('Net_Buyers', 0)
    buyer_count = row.get('Buyer_Count', 0)
    seller_count = row.get('Seller_Count', 0)
    holder_count = row.get('Holder_Count', 0)

    previous_total_value = total_value - delta_value
    delta_pct = (delta_value / previous_total_value * 100) if previous_total_value != 0 else 0

    score = 0
    reasoning = []

    if holder_count > 0:
        if net_buyers > 0:
            score += min(net_buyers * 2, 50)
            reasoning.append(f"Net buyers: {net_buyers}")
        else:
            score -= min(abs(net_buyers) * 2, 50)
            reasoning.append(f"Net sellers: {abs(net_buyers)}")

        if delta_pct > 0:
            score += min(delta_pct * 2, 30)
            reasoning.append(f"Positive delta: {delta_pct:.1f}%")
        else:
            score -= min(abs(delta_pct) * 2, 30)
            reasoning.append(f"Negative delta: {abs(delta_pct):.1f}%")

        if buyer_count > seller_count:
            score += min((buyer_count - seller_count), 20)
            reasoning.append(f"Buyers outnumber sellers")
        elif seller_count > buyer_count:
            score -= min((seller_count - buyer_count), 20)
            reasoning.append(f"Sellers outnumber buyers")

        if delta_value > 0 and total_value > 1_000_000:
            score += 20
            reasoning.append(f"Large position growth: ${delta_value/1_000_000:.1f}M")

    if price_change_pct is not None:
        price_weight = 0.15
        price_threshold = 3.0

        if price_change_pct > price_threshold:
            price_score = min(price_change_pct * 1.5, 15)
            score += price_score
            reasoning.append(f"Price up {price_change_pct:.1f}%")
        elif price_change_pct < -price_threshold:
            price_score = min(abs(price_change_pct) * 1.5, 15)
            score -= price_score
            reasoning.append(f"Price down {abs(price_change_pct):.1f}%")

    label = 'HOLD'
    if score >= 60:
        label = 'BUY'
    elif score <= -60:
        label = 'SELL'

    confidence = min(abs(score), 100) / 100

    return {
        'label': label,
        'confidence': float(confidence),
        'score': float(score),
        'reasoning': '; '.join(reasoning) if reasoning else 'Insufficient data',
        'total_value': float(total_value),
        'delta_value': float(delta_value),
        'delta_pct': float(delta_pct),
        'net_buyers': int(net_buyers),
        'buyer_count': int(buyer_count),
        'seller_count': int(seller_count),
        'price_change': float(price_change_pct) if price_change_pct is not None else None
    }


@cached(ttl_seconds=3600, key_prefix="portfolio_")
def get_quarter_data_cached(quarter: str) -> pd.DataFrame:
    """
    Cached wrapper for get_quarter_data with 1-hour TTL.

    Args:
        quarter (str): Quarter in 'YYYYQN' format.

    Returns:
        pd.DataFrame: Quarterly data for the specified quarter.
    """
    return get_quarter_data(quarter)


def get_stock_recommendation(ticker: str, quarter: str = None) -> dict[str, Any]:
    """
    Gets a BUY/SELL/HOLD recommendation for a specific stock.

    Args:
        ticker (str): Stock ticker.
        quarter (str, optional): Quarter in 'YYYYQN' format. Defaults to last quarter.

    Returns:
        dict: Recommendation with label and detailed metrics.
    """
    try:
        if quarter is None:
            quarter = get_last_quarter()

        df = get_quarter_data_cached(quarter)
        stock_df = df[df['Ticker'] == ticker.upper()]

        if stock_df.empty:
            return {
                'error': f'No data found for {ticker} in {quarter}'
            }

        if stock_df.empty:
            return {
                'error': f'No data found for {ticker} in {quarter}'
            }

        stock_df = stock_df.copy()

        total_value = stock_df['Value_Num'].sum()
        delta_value = stock_df['Delta_Value_Num'].sum()
        shares = stock_df['Shares'].sum()
        delta_shares = stock_df['Delta_Shares'].sum()

        previous_value = total_value - delta_value
        delta_pct = (delta_value / previous_value * 100) if previous_value != 0 else 0

        buyer_count = (stock_df['Delta_Value_Num'] > 0).sum()
        seller_count = (stock_df['Delta_Value_Num'] < 0).sum()
        new_holders = (stock_df['Delta_Shares'] > 0).sum()
        closed_holders = (stock_df['Shares'] == 0).sum()

        net_buyers = buyer_count - seller_count

        price_change_info = get_stock_price_change(ticker, quarter)
        price_change_pct = price_change_info.get('price_change')

        recommendation = calculate_recommendation_score(
            pd.DataFrame({
                'Total_Value': [total_value],
                'Total_Delta_Value': [delta_value],
                'Net_Buyers': [net_buyers],
                'Buyer_Count': [buyer_count],
                'Seller_Count': [seller_count],
                'Holder_Count': [(shares > 0).sum()],
                'New_Holder_Count': [new_holders],
                'Close_Count': [closed_holders]
            }),
            price_change_pct=price_change_pct
        )

        recommendation['ticker'] = ticker.upper()
        recommendation['company'] = stock_df.iloc[0]['Company']
        recommendation['quarter'] = quarter

        return recommendation
    except Exception as e:
        return {'error': str(e)}


def get_portfolio_analysis(tickers: list[str], quarter: str = None) -> list[dict[str, Any]]:
    """
    Gets analysis for multiple portfolio stocks.

    Args:
        tickers (list): List of stock tickers.
        quarter (str, optional): Quarter in 'YYYYQN' format. Defaults to last quarter.

    Returns:
        list: List of stock recommendations.
    """
    if not tickers:
        return []

    try:
        if quarter is None:
            quarter = get_last_quarter()

        results = []
        for ticker in tickers:
            recommendation = get_stock_recommendation(ticker, quarter)
            if 'error' not in recommendation:
                results.append(recommendation)

        return results
    except Exception as e:
        return []


def get_stock_holders(ticker: str, quarter: str = None) -> pd.DataFrame:
    """
    Get fund holders for a stock in a specific quarter.

    Args:
        ticker (str): Stock ticker.
        quarter (str, optional): Quarter in 'YYYYQN' format. Defaults to last quarter.

    Returns:
        pd.DataFrame: DataFrame with fund-level holdings.
    """
    try:
        if quarter is None:
            quarter = get_last_quarter()

        df = get_quarter_data_cached(quarter)
        stock_df = df[df['Ticker'] == ticker.upper()]

        if stock_df.empty:
            return pd.DataFrame()

        return aggregate_quarter_by_fund(stock_df)
    except Exception as e:
        return pd.DataFrame()


@cached(ttl_seconds=3600, key_prefix="price_date_")
def get_stock_price_by_date(ticker: str, date_str: str) -> dict[str, Any]:
    """
    Gets the price for a stock on a specific date.

    Uses PriceFetcher.get_avg_price() which returns the average of High and Low prices.
    Supports international tickers with fallback suffixes (TSX, TSXV).

    Args:
        ticker (str): Stock ticker symbol.
        date_str (str): Date string in 'YYYY-MM-DD' format.

    Returns:
        dict: Price information with ticker, date, price, and price type.
              Returns {'error': 'error message'} if price cannot be retrieved.
    """
    try:
        ticker_upper = ticker.upper()

        if not date_str:
            return {
                'error': 'Date string is required'
            }

        try:
            date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return {
                'error': f'Invalid date format. Expected YYYY-MM-DD, got: {date_str}'
            }

        price = PriceFetcher.get_avg_price(ticker_upper, date_obj)

        if price is None:
            return {
                'error': f'Price not found for {ticker_upper} on {date_str}'
            }

        return {
            'ticker': ticker_upper,
            'date': date_str,
            'price': float(price),
            'price_type': 'average',
            'note': 'Price is (High + Low) / 2'
        }
    except Exception as e:
        return {
            'error': str(e)
        }


@cached(ttl_seconds=3600, key_prefix="price_quarter_")
def get_stock_price_by_quarter(ticker: str, quarter: str) -> dict[str, Any]:
    """
    Gets the price for a stock at quarter-end (when funds report).

    Uses PriceFetcher.get_avg_price() which returns the average of High and Low prices.
    Supports international tickers with fallback suffixes (TSX, TSXV).

    Args:
        ticker (str): Stock ticker symbol.
        quarter (str): Quarter in 'YYYYQN' format.

    Returns:
        dict: Price information with ticker, quarter, quarter-end date, price, and price type.
              Returns {'error': 'error message'} if price cannot be retrieved.
    """
    try:
        ticker_upper = ticker.upper()

        if not quarter:
            return {
                'error': 'Quarter is required'
            }

        try:
            quarter_end_date = get_quarter_date(quarter)
        except Exception as e:
            return {
                'error': f'Invalid quarter format. Expected YYYYQN, got: {quarter}'
            }

        price = PriceFetcher.get_avg_price(ticker_upper, date.fromisoformat(quarter_end_date))

        if price is None:
            return {
                'error': f'Price not found for {ticker_upper} in {quarter} (quarter-end: {quarter_end_date})'
            }

        return {
            'ticker': ticker_upper,
            'quarter': quarter,
            'quarter_end_date': quarter_end_date,
            'price': float(price),
            'price_type': 'average',
            'note': 'Price is (High + Low) / 2'
        }
    except Exception as e:
        return {
            'error': str(e)
        }


@cached(ttl_seconds=3600, key_prefix="price_pnl_")
def get_stock_price_change(ticker: str, quarter: str = None) -> dict[str, Any]:
    """
    Calculates the percentage change between current price and reported quarter price.

    Uses PriceFetcher.get_avg_price() which returns the average of High and Low prices.
    Supports international tickers with fallback suffixes (TSX, TSXV).

    Args:
        ticker (str): Stock ticker symbol.
        quarter (str, optional): Quarter in 'YYYYQN' format. Defaults to last quarter.

    Returns:
        dict: Price change information with ticker, current price, reported price, 
              percentage change, and price change. Returns {'error': 'error message'} if 
              price cannot be retrieved.
    """
    try:
        ticker_upper = ticker.upper()

        if quarter is None:
            quarter = get_last_quarter()

        try:
            quarter_end_date = get_quarter_date(quarter)
        except Exception as e:
            return {
                'error': f'Invalid quarter format. Expected YYYYQN, got: {quarter}'
            }

        reported_price = PriceFetcher.get_avg_price(ticker_upper, date.fromisoformat(quarter_end_date))
        current_price = PriceFetcher.get_current_price(ticker_upper)

        if reported_price is None:
            return {
                'error': f'Reported price not found for {ticker_upper} in {quarter} (quarter-end: {quarter_end_date})'
            }

        if current_price is None:
            return {
                'error': f'Current price not found for {ticker_upper}'
            }

        price_change_pct = ((current_price - reported_price) / reported_price) * 100

        return {
            'ticker': ticker_upper,
            'reported_price': float(reported_price),
            'current_price': float(current_price),
            'price_change': float(price_change_pct),
            'quarter': quarter,
            'quarter_end_date': quarter_end_date,
            'price_type': 'average',
            'note': 'Prices are (High + Low) / 2'
        }
    except Exception as e:
        return {
            'error': str(e)
        }


def get_portfolio_price_changes(tickers: list[str], quarter: str = None) -> list[dict[str, Any]]:
    """
    Gets price change data for multiple portfolio stocks in a single request.

    Args:
        tickers (list): List of stock tickers.
        quarter (str, optional): Quarter in 'YYYYQN' format. Defaults to last quarter.

    Returns:
        list: List of price change information dictionaries. Returns empty list if 
              no tickers provided or if all requests fail.
    """
    if not tickers:
        return []

    try:
        if quarter is None:
            quarter = get_last_quarter()

        results = []
        for ticker in tickers:
            price_change = get_stock_price_change(ticker, quarter)
            if 'error' not in price_change:
                results.append(price_change)

        return results
    except Exception as e:
        return []


def get_portfolio_full_data(tickers: list[str], quarter: str = None) -> list[dict[str, Any]]:
    """
    Gets both recommendation and price change data for multiple portfolio stocks in a single request.

    Args:
        tickers (list): List of stock tickers.
        quarter (str, optional): Quarter in 'YYYYQN' format. Defaults to last quarter.

    Returns:
        list: List of dictionaries containing both recommendation and price change data.
              Returns empty list if no tickers provided or if all requests fail.
    """
    if not tickers:
        return []

    try:
        if quarter is None:
            quarter = get_last_quarter()

        results = []
        for ticker in tickers:
            recommendation = get_stock_recommendation(ticker, quarter)
            price_change = get_stock_price_change(ticker, quarter)

            combined = {
                'ticker': ticker.upper(),
                'recommendation': recommendation if 'error' not in recommendation else None,
                'price_change': price_change if 'error' not in price_change else None
            }
            results.append(combined)

        return results
    except Exception as e:
        return []
