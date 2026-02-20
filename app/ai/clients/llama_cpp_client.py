from app.ai.clients.base_openai_client import OpenAIClient


class LlamaCppClient(OpenAIClient):
    """
    Llama.cpp client implementation using OpenAI-compatible API.
    Runs locally with the Ollama server.
    """
    DEFAULT_MODEL = "glm_4_7_flash_q6_tools"


    def __init__(self, model: str = DEFAULT_MODEL):
        """
        Initializes the Llama.cpp client.

        Args:
            model: The model name to use (defaults to glm_4_7_flash_q6_tools)
        """
        super().__init__(model)


    def get_base_url(self) -> str:
        """
        Returns the base URL for the Llama.cpp server.
        """
        return "http://host.docker.internal:11434/v1/"


    def get_api_key_env_var(self) -> str:
        """
        Returns the name of the environment variable for the API key.
        Llama.cpp doesn't require authentication when running locally.
        Returns empty string since no API key is needed.
        """
        return "LLAMA_CPP_API_KEY"
