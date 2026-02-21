"""
AI service for API - wraps AI analysis functions.
"""
import logging
import pandas as pd
from app.utils.database import load_models
from app.ai.clients import GitHubClient, GoogleAIClient, GroqClient, HuggingFaceClient, OpenRouterClient, LlamaCppClient
from app.ai.agent import AnalystAgent
from app.utils.database import save_ai_analyst_report, save_ai_due_diligence_report
from typing import Any
import os

logger = logging.getLogger(__name__)


def normalize_column_names(data: Any) -> Any:
    """Normalize column names from uppercase to lowercase for UI compatibility.

    Args:
        data: DataFrame or list of dicts to normalize

    Returns:
        Normalized data with lowercase column names
    """
    if isinstance(data, pd.DataFrame):
        logger.info("Normalizing DataFrame column names to lowercase")
        columns = {col: col.lower() for col in data.columns}
        data = data.rename(columns=columns)
        return data.to_dict(orient='records')
    elif isinstance(data, list):
        if data and isinstance(data[0], dict):
            logger.info("Normalizing list of dicts column names to lowercase")
            normalized_data = []
            for item in data:
                normalized_item = {k.lower(): v for k, v in item.items()}
                normalized_data.append(normalized_item)
            return normalized_data
        return data
    return data


def clean_price_data(data: dict[str, Any]) -> dict[str, Any]:
    """Clean price-related data from formatted strings to numbers.

    Args:
        data: Dictionary containing price data

    Returns:
        Dictionary with cleaned price data
    """
    if not isinstance(data, dict):
        return data

    cleaned_data = data.copy()

    # Helper function to convert price strings to numbers
    def convert_price(value):
        if isinstance(value, str):
            try:
                # Remove dollar sign and commas, then convert to float
                cleaned = value.replace('$', '').replace(',', '')
                return float(cleaned)
            except (ValueError, AttributeError):
                return value
        return value

    # Convert current_price if it's a string
    if 'current_price' in cleaned_data and isinstance(cleaned_data['current_price'], str):
        cleaned_data['current_price'] = convert_price(cleaned_data['current_price'])

    # Convert investment_thesis price_target if it's a string
    if 'investment_thesis' in cleaned_data and isinstance(cleaned_data['investment_thesis'], dict):
        if 'price_target' in cleaned_data['investment_thesis'] and isinstance(cleaned_data['investment_thesis']['price_target'], str):
            cleaned_data['investment_thesis']['price_target'] = convert_price(cleaned_data['investment_thesis']['price_target'])

    return cleaned_data


class AIService:
    """Service for AI analysis operations."""

    @staticmethod
    def get_available_models() -> list[dict[str, Any]]:
        """Get available AI models.

        Returns:
            list: List of available AI models with their configurations.
                  Client information is removed for API serialization.
        """
        try:
            logger.info("Loading available AI models from database")
            models = load_models()
            logger.info(f"Successfully loaded {len(models)} models from database")

            # Remove client objects that can't be serialized
            for model in models:
                model.pop('Client', None)
            return models
        except Exception as e:
            logger.error(f"Failed to load models: {e}", exc_info=True)
            return []

    @staticmethod
    def get_ai_analyst(quarter: str, top_n: int = 30, model_id: str = "llama-3.3-70b-versatile") -> dict[str, Any] | pd.DataFrame | list[dict[str, Any]]:
        """Generate AI analyst ranked list of promising stocks.

        Args:
            quarter (str): Quarter in 'YYYYQN' format.
            top_n (int): Number of top stocks to return. Defaults to 30.
            model_id (str): AI model ID to use.

        Returns:
            dict: AI analyst analysis with ranked stocks.
        """
        try:
            logger.info(f"Starting AI analyst for quarter={quarter}, top_n={top_n}, model_id={model_id}")

            if not model_id:
                model_id = "llama-3.3-70b-versatile"
                logger.info(f"Using default model_id: {model_id}")

            logger.info(f"Looking up model info for: {model_id}")
            model_info = AIService.get_model_info(model_id)
            if not model_info:
                error_msg = f"Model {model_id} not found"
                logger.error(error_msg)
                return {
                    "error": error_msg,
                    "quarter": quarter,
                    "top_n": top_n
                }

            logger.info(f"Model found: {model_info.get('Description')}")

            client_type = model_info.get('Client', None)
            client = None

            logger.info(f"Client type: {client_type}")

            if client_type == GroqClient:
                logger.info("Instantiating GroqClient")
                if not os.getenv("GROQ_API_KEY"):
                    error_msg = "GROQ_API_KEY is not configured. Please set it in your .env file."
                    logger.error(error_msg)
                    return {
                        "error": error_msg,
                        "quarter": quarter,
                        "top_n": top_n
                    }
                client = GroqClient(model=model_id)
            elif client_type == GoogleAIClient:
                logger.info("Instantiating GoogleAIClient")
                if not os.getenv("GOOGLE_API_KEY"):
                    error_msg = "GOOGLE_API_KEY is not configured. Please set it in your .env file."
                    logger.error(error_msg)
                    return {
                        "error": error_msg,
                        "quarter": quarter,
                        "top_n": top_n
                    }
                client = GoogleAIClient(model=model_id)
            elif client_type == HuggingFaceClient:
                logger.info("Instantiating HuggingFaceClient")
                if not os.getenv("HUGGINGFACE_API_KEY"):
                    error_msg = "HUGGINGFACE_API_KEY is not configured. Please set it in your .env file."
                    logger.error(error_msg)
                    return {
                        "error": error_msg,
                        "quarter": quarter,
                        "top_n": top_n
                    }
                client = HuggingFaceClient(model=model_id)
            elif client_type == OpenRouterClient:
                logger.info("Instantiating OpenRouterClient")
                if not os.getenv("OPENROUTER_API_KEY"):
                    error_msg = "OPENROUTER_API_KEY is not configured. Please set it in your .env file."
                    logger.error(error_msg)
                    return {
                        "error": error_msg,
                        "quarter": quarter,
                        "top_n": top_n
                    }
                client = OpenRouterClient(model=model_id)
            elif client_type == GitHubClient:
                logger.info("Instantiating GitHubClient")
                if not os.getenv("GITHUB_TOKEN"):
                    error_msg = "GITHUB_TOKEN is not configured. Please set it in your .env file."
                    logger.error(error_msg)
                    return {
                        "error": error_msg,
                        "quarter": quarter,
                        "top_n": top_n
                    }
                client = GitHubClient(model=model_id)
            elif client_type == LlamaCppClient:
                logger.info("Instantiating LlamaCppClient")
                client = LlamaCppClient(model=model_id)
            else:
                error_msg = f"Unsupported client type: {client_type}"
                logger.error(error_msg)
                return {
                    "error": error_msg,
                    "quarter": quarter,
                    "top_n": top_n
                }

            logger.info("Creating AnalystAgent")
            analyst = AnalystAgent(quarter=quarter, ai_client=client)
            logger.info("Generating scored list")
            result = analyst.generate_scored_list(top_n)

            if isinstance(result, pd.DataFrame):
                logger.info(f"Converting DataFrame to list of dicts for serialization")
                result = normalize_column_names(result)

            logger.info(f"Successfully generated AI analysis with {len(result) if isinstance(result, (list, dict)) else 'unknown'} results")

            if isinstance(result, list) and len(result) > 0:
                logger.info("Saving AI analyst report")
                report_id = save_ai_analyst_report(quarter, model_id, result)
                if report_id:
                    logger.info(f"Report saved with ID: {report_id}")

            if isinstance(result, dict):
                report_id = save_ai_analyst_report(quarter, model_id, result.get('top_stocks', []))
                if report_id:
                    logger.info(f"Report saved with ID: {report_id}")
                    result['report_id'] = report_id

            return result
        except Exception as e:
            logger.error(f"AI analyst failed: {e}", exc_info=True)
            import traceback
            logger.error(f"Stack trace:\n{traceback.format_exc()}")
            return {"error": str(e)}

    @staticmethod
    def get_ai_due_diligence(ticker: str, quarter: str, model_id: str = "llama-3.3-70b-versatile") -> dict[str, Any]:
        """Run AI due diligence on a stock.

        Args:
            ticker (str): Stock ticker.
            quarter (str): Quarter in 'YYYYQN' format.
            model_id (str): AI model ID to use.

        Returns:
            dict: AI due diligence analysis for the stock.
        """
        try:
            logger.info(f"Starting AI due diligence for ticker={ticker}, quarter={quarter}, model_id={model_id}")

            if not model_id:
                model_id = "llama-3.3-70b-versatile"
                logger.info(f"Using default model_id: {model_id}")

            logger.info(f"Looking up model info for: {model_id}")
            model_info = AIService.get_model_info(model_id)
            if not model_info:
                error_msg = f"Model {model_id} not found"
                logger.error(error_msg)
                return {
                    "error": error_msg,
                    "ticker": ticker,
                    "quarter": quarter
                }

            logger.info(f"Model found: {model_info.get('Description')}")

            client_type = model_info.get('Client', None)
            client = None

            logger.info(f"Client type: {client_type}")

            if client_type == GroqClient:
                logger.info("Instantiating GroqClient")
                if not os.getenv("GROQ_API_KEY"):
                    error_msg = "GROQ_API_KEY is not configured. Please set it in your .env file."
                    logger.error(error_msg)
                    return {
                        "error": error_msg,
                        "ticker": ticker,
                        "quarter": quarter
                    }
                client = GroqClient(model=model_id)
            elif client_type == GoogleAIClient:
                logger.info("Instantiating GoogleAIClient")
                if not os.getenv("GOOGLE_API_KEY"):
                    error_msg = "GOOGLE_API_KEY is not configured. Please set it in your .env file."
                    logger.error(error_msg)
                    return {
                        "error": error_msg,
                        "ticker": ticker,
                        "quarter": quarter
                    }
                client = GoogleAIClient(model=model_id)
            elif client_type == HuggingFaceClient:
                logger.info("Instantiating HuggingFaceClient")
                if not os.getenv("HUGGINGFACE_API_KEY"):
                    error_msg = "HUGGINGFACE_API_KEY is not configured. Please set it in your .env file."
                    logger.error(error_msg)
                    return {
                        "error": error_msg,
                        "ticker": ticker,
                        "quarter": quarter
                    }
                client = HuggingFaceClient(model=model_id)
            elif client_type == OpenRouterClient:
                logger.info("Instantiating OpenRouterClient")
                if not os.getenv("OPENROUTER_API_KEY"):
                    error_msg = "OPENROUTER_API_KEY is not configured. Please set it in your .env file."
                    logger.error(error_msg)
                    return {
                        "error": error_msg,
                        "ticker": ticker,
                        "quarter": quarter
                    }
                client = OpenRouterClient(model=model_id)
            elif client_type == GitHubClient:
                logger.info("Instantiating GitHubClient")
                if not os.getenv("GITHUB_TOKEN"):
                    error_msg = "GITHUB_TOKEN is not configured. Please set it in your .env file."
                    logger.error(error_msg)
                    return {
                        "error": error_msg,
                        "ticker": ticker,
                        "quarter": quarter
                    }
                client = GitHubClient(model=model_id)
            elif client_type == LlamaCppClient:
                logger.info("Instantiating LlamaCppClient")
                client = LlamaCppClient(model=model_id)
            else:
                error_msg = f"Unsupported client type: {client_type}"
                logger.error(error_msg)
                return {
                    "error": error_msg,
                    "ticker": ticker,
                    "quarter": quarter
                }

            logger.info("Creating AnalystAgent")
            analyst = AnalystAgent(quarter=quarter, ai_client=client)
            logger.info("Running stock due diligence")
            result = analyst.run_stock_due_diligence(ticker)

            logger.info("Successfully completed AI due diligence")

            if isinstance(result, dict) and 'ticker' in result:
                logger.info("Saving AI due diligence report")
                report_id = save_ai_due_diligence_report(ticker, quarter, model_id, result)
                if report_id:
                    logger.info(f"Report saved with ID: {report_id}")
                    result['report_id'] = report_id

            return result
        except Exception as e:
            logger.error(f"AI due diligence failed: {e}", exc_info=True)
            import traceback
            logger.error(f"Stack trace:\n{traceback.format_exc()}")
            return {"error": str(e)}

    @staticmethod
    def get_model_info(model_id: str) -> dict[str, Any] | None:
        """Get information about a specific AI model.

        Args:
            model_id (str): AI model ID.

        Returns:
            dict | None: Model information including client type or None if not found.
        """
        try:
            logger.debug(f"Looking up model info for: {model_id}")
            models = load_models()
            for model in models:
                if model.get('ID') == model_id:
                    logger.info(f"Found model: {model.get('Description')}")
                    return model
            logger.warning(f"Model not found: {model_id}")
            return None
        except Exception as e:
            logger.error(f"Failed to get model info for {model_id}: {e}", exc_info=True)
            return None

    @staticmethod
    def get_supported_models() -> list[str]:
        """Get list of supported AI model IDs.

        Returns:
            list: List of supported model IDs.
        """
        try:
            logger.debug("Getting supported models list")
            models = AIService.get_available_models()
            model_ids = [model.get('ID', '') for model in models if model.get('ID')]
            logger.info(f"Supported models: {model_ids}")
            return model_ids
        except Exception as e:
            logger.error(f"Failed to get supported models: {e}", exc_info=True)
            return []

    @staticmethod
    def get_ai_analyst_report(report_id: str) -> dict[str, Any] | None:
        """Get a specific AI analyst report by ID.

        Args:
            report_id: Report ID to retrieve

        Returns:
            dict: Report data or None if not found
        """
        try:
            logger.info(f"Retrieving AI analyst report: {report_id}")
            from app.utils.database import get_report_by_id
            report_data = get_report_by_id('ai_analyst', report_id)
            if report_data and 'top_stocks' in report_data:
                report_data['top_stocks'] = normalize_column_names(report_data['top_stocks'])
            return report_data
        except Exception as e:
            logger.error(f"Failed to get AI analyst report: {e}", exc_info=True)
            return None

    @staticmethod
    def get_ai_analyst_reports() -> list[dict[str, Any]]:
        """Get all AI analyst reports.

        Returns:
            list: List of report metadata dictionaries
        """
        try:
            logger.info("Getting all AI analyst reports")
            from app.utils.database import get_all_reports
            return get_all_reports('ai_analyst')
        except Exception as e:
            logger.error(f"Failed to get AI analyst reports: {e}", exc_info=True)
            return []

    @staticmethod
    def get_ai_analyst_reports_by_quarter(quarter: str) -> list[dict[str, Any]]:
        """Get all AI analyst reports for a specific quarter.

        Args:
            quarter: Quarter in 'YYYYQN' format

        Returns:
            list: List of report metadata dictionaries for the specified quarter
        """
        try:
            logger.info(f"Getting AI analyst reports for quarter: {quarter}")
            from app.utils.database import get_all_reports

            all_reports = get_all_reports('ai_analyst')
            quarter_reports = [r for r in all_reports if r.get('quarter') == quarter]

            logger.info(f"Found {len(quarter_reports)} reports for quarter {quarter}")
            return quarter_reports
        except Exception as e:
            logger.error(f"Failed to get AI analyst reports by quarter: {e}", exc_info=True)
            return []

    @staticmethod
    def get_last_ai_analyst_report() -> dict[str, Any] | None:
        """Get the most recent AI analyst report.

        Returns:
            dict: Report data or None if no reports exist
        """
        try:
            logger.info("Getting last AI analyst report")
            from app.utils.database import get_last_report
            report_data = get_last_report('ai_analyst')
            if report_data and 'top_stocks' in report_data:
                report_data['top_stocks'] = normalize_column_names(report_data['top_stocks'])
            return report_data
        except Exception as e:
            logger.error(f"Failed to get last AI analyst report: {e}", exc_info=True)
            return None

    @staticmethod
    def get_ai_due_diligence_report(report_id: str) -> dict[str, Any] | None:
        """Get a specific AI due diligence report by ID.

        Args:
            report_id: Report ID to retrieve

        Returns:
            dict: Report data or None if not found
        """
        try:
            logger.info(f"Retrieving AI due diligence report: {report_id}")
            from app.utils.database import get_report_by_id
            report_data = get_report_by_id('ai_due_diligence', report_id)
            if report_data and 'stock_analysis' in report_data:
                report_data['stock_analysis'] = clean_price_data(report_data['stock_analysis'])
            return report_data
        except Exception as e:
            logger.error(f"Failed to get AI due diligence report: {e}", exc_info=True)
            return None

    @staticmethod
    def get_all_ai_due_diligence_reports() -> list[dict[str, Any]]:
        """Get all AI due diligence reports.

        Returns:
            list: List of report metadata dictionaries
        """
        try:
            logger.info("Getting all AI due diligence reports")
            from app.utils.database import get_all_reports
            return get_all_reports('ai_due_diligence')
        except Exception as e:
            logger.error(f"Failed to get AI due diligence reports: {e}", exc_info=True)
            return []

    @staticmethod
    def get_last_ai_due_diligence_report() -> dict[str, Any] | None:
        """Get the most recent AI due diligence report.

        Returns:
            dict: Report data or None if no reports exist
        """
        try:
            logger.info("Getting last AI due diligence report")
            from app.utils.database import get_last_report
            return get_last_report('ai_due_diligence')
        except Exception as e:
            logger.error(f"Failed to get last AI due diligence report: {e}", exc_info=True)
            return None

    @staticmethod
    def get_all_ai_analyst_reports() -> list[dict[str, Any]]:
        """Get all AI analyst reports.

        Returns:
            list: List of report metadata dictionaries
        """
        try:
            logger.info("Getting all AI analyst reports")
            from app.utils.database import get_all_reports
            return get_all_reports('ai_analyst')
        except Exception as e:
            logger.error(f"Failed to get all AI analyst reports: {e}", exc_info=True)
            return []
