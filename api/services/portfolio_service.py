"""
Portfolio service for API - provides portfolio management and stock recommendations.
"""
from app.analysis.stocks import get_quarter_data, _aggregate_stock_data, _calculate_derived_metrics, aggregate_quarter_by_fund
from app.utils.database import load_stocks, get_last_quarter
from typing import Any
import pandas as pd
import numpy as np


def calculate_recommendation_score(df_analysis: pd.DataFrame) -> dict[str, Any]:
    """
    Calculates a BUY/SELL/HOLD recommendation based on institutional activity.

    Args:
        df_analysis (pd.DataFrame): Stock analysis DataFrame with aggregated fund data.

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
        'seller_count': int(seller_count)
    }


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

        df = get_quarter_data(quarter)
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

        recommendation = calculate_recommendation_score(pd.DataFrame({
            'Total_Value': [total_value],
            'Total_Delta_Value': [delta_value],
            'Net_Buyers': [net_buyers],
            'Buyer_Count': [buyer_count],
            'Seller_Count': [seller_count],
            'Holder_Count': [(shares > 0).sum()],
            'New_Holder_Count': [new_holders],
            'Close_Count': [closed_holders]
        }))

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

        df = get_quarter_data(quarter)
        stock_df = df[df['Ticker'] == ticker.upper()]

        if stock_df.empty:
            return pd.DataFrame()

        return aggregate_quarter_by_fund(stock_df)
    except Exception as e:
        return pd.DataFrame()
