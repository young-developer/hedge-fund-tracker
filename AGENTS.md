# AGENTS.md

## Build, Test & Lint Commands

### Development Setup
```bash
pipenv install
pipenv run python -m app.main
pipenv run uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

### Running Tests

**Unit Tests**:
```bash
pipenv run python -m unittest discover              # All tests
pipenv run python -m unittest tests.api.test_health # Specific file
pipenv run python -m unittest discover -v          # Verbose
```

**API Tests (pytest)**:
```bash
pipenv run python -m pytest tests/api/ -v              # All API tests
pipenv run python -m pytest tests/api/test_funds.py -v  # Specific file
```

### Linting & Quality
```bash
# Run tests before committing
pipenv run python -m unittest discover
```

## Code Style Guidelines

### Python Version & Type Hints
- Use Python 3.13+ syntax and features
- Always include type hints for function parameters and return values
- Use modern type hints: `list[str]`, `str | None`
- Use `|` union operator for type annotations (PEP 604)

### Imports Organization
```python
# 1. Standard library imports
from pathlib import Path
import re

# 2. Third-party imports
import pandas as pd

# 3. Local imports (relative)
from app.config import config
```

### Naming Conventions
- **Classes**: PascalCase (`FundService`, `APIResponse`)
- **Functions & Methods**: snake_case (`get_all_funds`, `load_hedge_funds`)
- **Constants**: UPPER_SNAKE_CASE (`DB_FOLDER`, `APP_NAME`)

### Code Structure

**Function Structure**:
- Always include Google-style docstrings
- Type hints on all parameters and return values

```python
def get_all_quarters() -> list[str]:
    """Returns a sorted list of all quarter directories."""
    return sorted([
        path.name for path in Path(DB_FOLDER).iterdir()
        if path.is_dir() and re.match(r'^\d{4}Q[1-4]$', path.name)
    ], reverse=True)
```

**Class Structure**:
- Include class docstring
- Use `@classmethod` and static methods appropriately

```python
class Config:
    """Application configuration class."""

    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")

    @classmethod
    def ensure_directories(cls) -> None:
        """Ensure all required directories exist."""
        cls.DB_FOLDER.mkdir(parents=True, exist_ok=True)
```

### Error Handling

**API Endpoints**:
- Use try-except blocks with proper error handling
- Return `APIResponse` wrapper for all endpoints
- Include success status, data, message, and error fields

```python
@router.get("/{fund_name}/holdings/{quarter}", response_model=APIResponse)
async def get_fund_holdings(fund_name: str, quarter: str):
    try:
        holdings = FundService.get_fund_holdings(fund_name, quarter)
        if holdings.empty:
            return APIResponse(success=False, error=f"No holdings found for {fund_name} in {quarter}", message="No data available")
        return APIResponse(success=True, data=holdings.to_dict('records'), message=f"Retrieved {len(holdings)} holdings")
    except Exception as e:
        return APIResponse(success=False, error=str(e), message="Failed to retrieve holdings")
```

### Pydantic Models

**API Response Models**:
- Use `BaseModel` from pydantic
- Include `Field` for validation with description
- Use modern type hints (`str | None`, `list[dict]`)

```python
class APIResponse(BaseModel):
    """Standard API response wrapper."""
    success: bool
    data: Any = None
    message: str | None = None
    error: str | None = None

class AIScore(BaseModel):
    """AI score for a stock."""
    ticker: str
    promise_score: float
    risk_score: float
    growth_score: float
```

**Request Models**:
- Use `Field` for validation with constraints

```python
class AIAnalystRequest(BaseModel):
    """AI analyst request."""
    quarter: str = Field(..., description="Quarter in YYYYQN format")
    top_n: int = Field(30, ge=1, le=100, description="Number of stocks to return")
```

**Request Models**:
- Use `Field` for validation with constraints

```python
class AIAnalystRequest(BaseModel):
    """AI analyst request."""
    quarter: str = Field(..., description="Quarter in YYYYQN format")
    top_n: int = Field(30, ge=1, le=100, description="Number of stocks to return")
```

### Testing Guidelines

**Test Structure**:
- Use `unittest.TestCase` for unit tests
- Create separate test files for each module
- Mock external dependencies with `@patch`

### Database & CSV Operations

- Use pandas for data manipulation when possible
- Always handle empty DataFrames
- Use `Path` for file paths
- Use `csv.writer` with `QUOTE_ALL` for proper quoting

### Environment Variables

- Use `python-dotenv` for environment loading
- Provide sensible defaults in code
- Use type hints for configuration attributes

```python
class Config:
    """Application configuration."""

    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))

    @classmethod
    def ensure_directories(cls) -> None:
        """Ensure all required directories exist."""
        cls.DB_FOLDER.mkdir(parents=True, exist_ok=True)
```

### Project Structure

```
hedge-fund-tracker/
├── app/          # Application logic, READ ONLY
├── api/          # FastAPI application
├── database/     # Data storage (CSV files)
├── tests/        # Test suite
├── Pipfile       # Dependencies
└── README.md     # Documentation
```


## Workflow

1. **Before Starting**: Read README and AGENTS.md
2. **Code Changes**: Follow style guidelines above
3. **Testing**: Run `pipenv run python -m unittest discover` before committing
4. **Commit**: Use clear messages (e.g., "Add feature X")
5. DONT MODIFY files in `app` folder
