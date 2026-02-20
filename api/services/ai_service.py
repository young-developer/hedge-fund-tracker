"""
AI service for API - wraps AI analysis functions.
"""
from app.utils.database import load_models
from app.ai.clients import GitHubClient, GoogleAIClient, GroqClient, HuggingFaceClient, OpenRouterClient, LlamaCppClient
from app.ai.agent import AnalystAgent
from typing import Any
import os


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
            models = load_models()
            # Remove client objects that can't be serialized
            for model in models:
                model.pop('Client', None)
            return models
        except Exception as e:
            return []

    @staticmethod
    def get_ai_analyst(quarter: str, top_n: int = 30, model_id: str = "llama-3.3-70b-versatile") -> dict[str, Any]:
        """Generate AI analyst ranked list of promising stocks.

        Args:
            quarter (str): Quarter in 'YYYYQN' format.
            top_n (int): Number of top stocks to return. Defaults to 30.
            model_id (str): AI model ID to use.

        Returns:
            dict: AI analyst analysis with ranked stocks.
        """
        try:
            if not model_id:
                model_id = "llama-3.3-70b-versatile"

            model_info = AIService.get_model_info(model_id)
            if not model_info:
                return {
                    "error": f"Model {model_id} not found",
                    "quarter": quarter,
                    "top_n": top_n
                }

            client_type = model_info.get('Client', '')
            client = None

            if client_type == 'Groq':
                if not os.getenv("GROQ_API_KEY"):
                    return {
                        "error": "GROQ_API_KEY is not configured. Please set it in your .env file.",
                        "quarter": quarter,
                        "top_n": top_n
                    }
                client = GroqClient(model=model_id)
            elif client_type == 'Google':
                if not os.getenv("GOOGLE_API_KEY"):
                    return {
                        "error": "GOOGLE_API_KEY is not configured. Please set it in your .env file.",
                        "quarter": quarter,
                        "top_n": top_n
                    }
                client = GoogleAIClient(model=model_id)
            elif client_type == 'HuggingFace':
                if not os.getenv("HUGGINGFACE_API_KEY"):
                    return {
                        "error": "HUGGINGFACE_API_KEY is not configured. Please set it in your .env file.",
                        "quarter": quarter,
                        "top_n": top_n
                    }
                client = HuggingFaceClient(model=model_id)
            elif client_type == 'OpenRouter':
                if not os.getenv("OPENROUTER_API_KEY"):
                    return {
                        "error": "OPENROUTER_API_KEY is not configured. Please set it in your .env file.",
                        "quarter": quarter,
                        "top_n": top_n
                    }
                client = OpenRouterClient(model=model_id)
            elif client_type == 'GitHub':
                if not os.getenv("GITHUB_TOKEN"):
                    return {
                        "error": "GITHUB_TOKEN is not configured. Please set it in your .env file.",
                        "quarter": quarter,
                        "top_n": top_n
                    }
                client = GitHubClient(model=model_id)
            elif client_type == 'LlamaCpp':
                client = LlamaCppClient(model=model_id)
            else:
                return {
                    "error": f"Unsupported client type: {client_type}",
                    "quarter": quarter,
                    "top_n": top_n
                }

            analyst = AnalystAgent(quarter=quarter, ai_client=client)
            result = analyst.generate_scored_list(top_n)

            return result
        except Exception as e:
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
            if not model_id:
                model_id = "llama-3.3-70b-versatile"

            model_info = AIService.get_model_info(model_id)
            if not model_info:
                return {
                    "error": f"Model {model_id} not found",
                    "ticker": ticker,
                    "quarter": quarter
                }

            client_type = model_info.get('Client', '')
            client = None

            if client_type == 'Groq':
                if not os.getenv("GROQ_API_KEY"):
                    return {
                        "error": "GROQ_API_KEY is not configured. Please set it in your .env file.",
                        "ticker": ticker,
                        "quarter": quarter
                    }
                client = GroqClient(model=model_id)
            elif client_type == 'Google':
                if not os.getenv("GOOGLE_API_KEY"):
                    return {
                        "error": "GOOGLE_API_KEY is not configured. Please set it in your .env file.",
                        "ticker": ticker,
                        "quarter": quarter
                    }
                client = GoogleAIClient(model=model_id)
            elif client_type == 'HuggingFace':
                if not os.getenv("HUGGINGFACE_API_KEY"):
                    return {
                        "error": "HUGGINGFACE_API_KEY is not configured. Please set it in your .env file.",
                        "ticker": ticker,
                        "quarter": quarter
                    }
                client = HuggingFaceClient(model=model_id)
            elif client_type == 'OpenRouter':
                if not os.getenv("OPENROUTER_API_KEY"):
                    return {
                        "error": "OPENROUTER_API_KEY is not configured. Please set it in your .env file.",
                        "ticker": ticker,
                        "quarter": quarter
                    }
                client = OpenRouterClient(model=model_id)
            elif client_type == 'GitHub':
                if not os.getenv("GITHUB_TOKEN"):
                    return {
                        "error": "GITHUB_TOKEN is not configured. Please set it in your .env file.",
                        "ticker": ticker,
                        "quarter": quarter
                    }
                client = GitHubClient(model=model_id)
            elif client_type == 'LlamaCpp':
                client = LlamaCppClient(model=model_id)
            else:
                return {
                    "error": f"Unsupported client type: {client_type}",
                    "ticker": ticker,
                    "quarter": quarter
                }

            analyst = AnalystAgent(quarter=quarter, ai_client=client)
            result = analyst.run_stock_due_diligence(ticker)

            return result
        except Exception as e:
            return {"error": str(e)}

    @staticmethod
    def get_model_info(model_id: str) -> dict[str, Any] | None:
        """Get information about a specific AI model.

        Args:
            model_id (str): AI model ID.

        Returns:
            dict | None: Model information or None if not found.
        """
        try:
            models = AIService.get_available_models()
            for model in models:
                if model.get('id') == model_id:
                    return model
            return None
        except Exception:
            return None

    @staticmethod
    def get_supported_models() -> list[str]:
        """Get list of supported AI model IDs.

        Returns:
            list: List of supported model IDs.
        """
        try:
            models = AIService.get_available_models()
            return [model.get('id', '') for model in models if model.get('id')]
        except Exception:
            return []
