"""
Test SP500 status API integration.
"""
import unittest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from api.main import app


class TestSP500StatusIntegration(unittest.TestCase):
    """Test SP500 status integration with the API."""

    def setUp(self):
        """Set up test client."""
        self.client = TestClient(app)

    def test_nflx_sp500_status(self):
        """Test NFLX SP500 status returns True."""
        response = self.client.get("/api/stocks/NFLX/is-sp500-stock")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertTrue(data['data'])  # NFLX should be in S&P 500

    def test_sp500_sp500_status(self):
        """Test SP500 SP500 status returns False (SP500 is an index, not a stock)."""
        response = self.client.get("/api/stocks/SP500/is-sp500-stock")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertFalse(data['data'])  # SP500 should not be in S&P 500

    def test_aapl_sp500_status(self):
        """Test AAPL SP500 status returns True."""
        response = self.client.get("/api/stocks/AAPL/is-sp500-stock")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertTrue(data['data'])  # AAPL should be in S&P 500

    def test_unknown_stock_sp500_status(self):
        """Test unknown stock SP500 status returns False."""
        response = self.client.get("/api/stocks/UNKNOWN/is-sp500-stock")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertFalse(data['data'])  # UNKNOWN should not be in S&P 500


if __name__ == '__main__':
    unittest.main()
