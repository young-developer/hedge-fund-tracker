"""
Pydantic models for AI reports.
"""
from typing import Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime


class ReportMetadata(BaseModel):
    """Report metadata and identifiers."""
    report_id: str = Field(..., description="Unique report identifier")
    type: str = Field(..., description="Report type: 'ai_analyst' or 'ai_due_diligence'")
    quarter: str = Field(..., description="Quarter in YYYYQN format")
    model_id: str = Field(..., description="AI model ID used for generation")
    generated_at: datetime = Field(..., description="Report generation timestamp")


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


class AIAnalystReport(BaseModel):
    """Complete AI analyst report with metadata."""
    metadata: ReportMetadata
    top_stocks: list[AIScore]


class AIDueDiligenceAnalysis(BaseModel):
    """Stock analysis from AI due diligence."""
    ticker: str
    company: str
    current_price: float
    investment_thesis: dict[str, Any]
    overall_sentiment: str
    analysis: dict[str, Any]


class AIDueDiligenceReport(BaseModel):
    """Complete AI due diligence report with metadata."""
    metadata: ReportMetadata
    stock_analysis: AIDueDiligenceAnalysis


class ReportResponse(BaseModel):
    """Standard API response wrapper for reports."""
    success: bool
    data: Any = None
    message: str | None = None
    error: str | None = None


class ReportListResponse(BaseModel):
    """Response with list of reports."""
    success: bool
    data: list[dict[str, Any]] = Field(default_factory=list)
    message: str | None = None
    error: str | None = None
