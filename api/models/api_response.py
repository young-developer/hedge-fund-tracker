"""
Pydantic models for API requests and responses.
"""
from typing import Optional, Any
from pydantic import BaseModel, Field


# Common Response Models
class APIResponse(BaseModel):
    """Standard API response wrapper."""
    success: bool
    data: Any = None
    message: str | None = None
    error: str | None = None


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    version: str
    database_connected: bool


# Fund Models
class Fund(BaseModel):
    """Fund information."""
    cik: str
    fund: str
    manager: str
    denomination: str
    ciks: str = ""


class FundQuarter(BaseModel):
    """Fund quarter information."""
    quarter: str
    fund: str
    file_count: int
    holdings_count: int


class FundHolding(BaseModel):
    """Fund stock holding."""
    cusip: str
    ticker: str
    company: str
    shares: int
    value: float
    portfolio_pct: float
    delta: str
    delta_value: float


class FundPerformance(BaseModel):
    """Fund performance evaluation."""
    fund: str
    quarter: str
    portfolio_return: float
    start_value: float
    top_contributors: list[dict[str, Any]]
    top_detractors: list[dict[str, Any]]


# Stock Models
class Stock(BaseModel):
    """Stock information."""
    cusip: str
    ticker: str
    company: str


class StockHolder(BaseModel):
    """Stock holder information."""
    fund: str
    portfolio_pct: float
    shares: int
    value: float
    delta: str
    delta_value: float


class StockAnalysis(BaseModel):
    """Stock analysis."""
    ticker: str
    company: str
    total_value: float
    total_delta_value: float
    avg_percentage: float
    max_percentage: float
    holder_count: int
    num_buyers: int
    num_sellers: int
    new_holder_count: int
    close_count: int


# Quarter Analysis Models
class QuarterAnalysisStock(BaseModel):
    """Stock in quarter analysis."""
    ticker: str
    company: str
    delta: float
    net_buyers: int
    buyer_count: int
    seller_count: int
    holder_count: int
    total_delta_value: float
    total_value: float
    max_portfolio_pct: float
    avg_portfolio_pct: float
    new_holder_count: int
    close_count: int


class QuarterAnalysis(BaseModel):
    """Quarter analysis summary."""
    quarter: str
    total_funds: int
    total_stocks: int
    top_buys: list[QuarterAnalysisStock]
    top_rising: list[QuarterAnalysisStock]
    top_bets: list[QuarterAnalysisStock]


# Non-Quarterly Filing Models
class Filing(BaseModel):
    """Non-quarterly filing information."""
    date: str
    fund: str
    ticker: str
    cusip: str
    company: str
    delta: str
    delta_shares: int
    avg_price: float
    current_price: float
    price_var: float
    value: float


class FilingsResponse(BaseModel):
    """Non-quarterly filings response."""
    total_filings: int
    recent_filings: list[Filing]


# AI Models
class AIModel(BaseModel):
    """AI model information."""
    id: str
    description: str
    client: str


class AIAnalystRequest(BaseModel):
    """AI analyst request."""
    quarter: str = Field(..., description="Quarter in YYYYQN format")
    top_n: int = Field(30, ge=1, le=100, description="Number of stocks to return")
    model_id: str = Field(..., description="AI model ID")


class AIScore(BaseModel):
    """AI score for a stock."""
    ticker: str
    company: str
    industry: str
    promise_score: float
    risk_score: float
    volatility_score: float
    momentum_score: float
    growth_score: float


class AIAnalystResponse(BaseModel):
    """AI analyst response."""
    model: str
    quarter: str
    top_stocks: list[AIScore]


class AIDueDiligenceRequest(BaseModel):
    """AI due diligence request."""
    ticker: str = Field(..., description="Stock ticker")
    quarter: str = Field(..., description="Quarter in YYYYQN format")
    model_id: str = Field(..., description="AI model ID")


class AIDueDiligenceResponse(BaseModel):
    """AI due diligence response."""
    ticker: str
    company: str
    current_price: float
    investment_thesis: dict[str, Any]
    overall_sentiment: str
    analysis: dict[str, Any]
