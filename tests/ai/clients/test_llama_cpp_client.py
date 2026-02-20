import unittest
from unittest.mock import patch, MagicMock, call
from app.ai.clients.llama_cpp_client import LlamaCppClient


class TestLlamaCppClient(unittest.TestCase):
    def setUp(self):
        self.test_model = "glm_4_7_flash_q6_tools"
        self.client = LlamaCppClient(model=self.test_model)


    @patch('app.ai.clients.base_openai_client.OpenAI')
    def test_client_initialization(self, mock_openai):
        """Test that the client initializes correctly with default model"""
        mock_instance = mock_openai.return_value
        mock_instance.chat.completions.create.return_value = MagicMock(
            choices=[MagicMock(message=MagicMock(content="Test response"))]
        )

        client = LlamaCppClient()
        self.assertEqual(client.model, LlamaCppClient.DEFAULT_MODEL)
        mock_openai.assert_called_once_with(
            base_url="http://127.0.0.1:11434/v1",
            api_key=None,
            default_headers={}
        )


    @patch('app.ai.clients.base_openai_client.OpenAI')
    def test_generate_content_invocation(self, mock_openai):
        """Test that generate_content properly invokes the API"""
        mock_instance = mock_openai.return_value
        mock_response = MagicMock()
        mock_response.choices = [MagicMock(message=MagicMock(content="Test response"))]
        mock_instance.chat.completions.create.return_value = mock_response

        prompt = "Test prompt"
        response = self.client.generate_content(prompt)

        self.assertEqual(response, "Test response")
        mock_instance.chat.completions.create.assert_called_once_with(
            model=self.test_model,
            messages=[{"role": "user", "content": prompt}],
            extra_body={}
        )


    @patch('app.ai.clients.base_openai_client.OpenAI')
    def test_custom_model(self, mock_openai):
        """Test that a custom model can be used"""
        custom_model = "custom_model_name"
        mock_instance = mock_openai.return_value
        mock_response = MagicMock()
        mock_response.choices = [MagicMock(message=MagicMock(content="Test response"))]
        mock_instance.chat.completions.create.return_value = mock_response

        client = LlamaCppClient(model=custom_model)
        self.assertEqual(client.model, custom_model)

        client.generate_content("Test prompt")
        mock_instance.chat.completions.create.assert_called_once_with(
            model=custom_model,
            messages=[{"role": "user", "content": "Test prompt"}],
            extra_body={}
        )


    @patch('app.ai.clients.base_openai_client.OpenAI')
    def test_get_base_url(self, mock_openai):
        """Test that get_base_url returns the correct URL"""
        self.assertEqual(self.client.get_base_url(), "http://127.0.0.1:11434/v1")


    @patch('app.ai.clients.base_openai_client.OpenAI')
    def test_get_api_key_env_var(self, mock_openai):
        """Test that get_api_key_env_var returns None (no API key needed)"""
        self.assertIsNone(self.client.get_api_key_env_var())


    @patch('app.ai.clients.base_openai_client.OpenAI')
    def test_generate_content_with_kwargs(self, mock_openai):
        """Test that generate_content accepts and passes through kwargs"""
        mock_instance = mock_openai.return_value
        mock_response = MagicMock()
        mock_response.choices = [MagicMock(message=MagicMock(content="Test response"))]
        mock_instance.chat.completions.create.return_value = mock_response

        prompt = "Test prompt"
        response = self.client.generate_content(prompt, temperature=0.7, max_tokens=100)

        self.assertEqual(response, "Test response")
        mock_instance.chat.completions.create.assert_called_once_with(
            model=self.test_model,
            messages=[{"role": "user", "content": prompt}],
            extra_body={},
            temperature=0.7,
            max_tokens=100
        )


    @patch('app.ai.clients.base_openai_client.OpenAI')
    def test_generate_content_with_extra_body(self, mock_openai):
        """Test that generate_content handles extra_body parameter"""
        mock_instance = mock_openai.return_value
        mock_response = MagicMock()
        mock_response.choices = [MagicMock(message=MagicMock(content="Test response"))]
        mock_instance.chat.completions.create.return_value = mock_response

        prompt = "Test prompt"
        response = self.client.generate_content(prompt, extra_body={"param": "value"})

        self.assertEqual(response, "Test response")
        mock_instance.chat.completions.create.assert_called_once_with(
            model=self.test_model,
            messages=[{"role": "user", "content": prompt}],
            extra_body={"param": "value"}
        )


    @patch('app.ai.clients.base_openai_client.OpenAI')
    def test_get_model_name(self, mock_openai):
        """Test that get_model_name returns the correct model name"""
        self.assertEqual(self.client.get_model_name(), self.test_model)


if __name__ == '__main__':
    unittest.main()
