# Hedge Fund Tracker - Agent Guidelines

## Build, Test, and Lint Commands

### Running Tests
```bash
# Run all tests
pipenv run python -m unittest

# Run specific test module
pipenv run python -m unittest tests.ai.clients.test_llama_cpp_client

# Run specific test method
pipenv run python -m unittest tests.ai.clients.test_llama_cpp_client.TestLlamaCppClient.test_client_initialization

# Run tests with verbose output
pipenv run python -m unittest -v
```

### Running the Application
```bash
# Run main application
pipenv run python -m app.main

# Run API server
pipenv run uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload

# Run database updater
pipenv run python -m database.updater

# Run UI (from ui directory)
cd ui
npm run dev
```

## Code Style Guidelines

### Imports
- Import statements should be sorted alphabetically
- Group imports as: stdlib → third-party → local
- Use absolute imports
- Avoid wildcard imports (except in `__init__.py` files)

### Formatting
- Follow PEP 8 guidelines
- Use 4 spaces for indentation
- Lines should be wrapped at 79-88 characters (typical Python standard)
- No trailing whitespace

### Naming Conventions
- **Functions and variables**: `snake_case`
- **Classes**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Private methods**: `_leading_underscore`
- **Protected methods**: `__double_leading_underscore`

### Type Hints
- Use Python 3.13+ type hints consistently
- Specify return types for all functions
- Use `list[dict]` instead of `List[Dict]` for modern syntax
- Use `Any` for flexible types when needed
- Example:
```python
def search_stocks(query: str) -> list[dict[str, Any]]:
    """Search stocks by ticker or company name."""
    ...
```

### Documentation (Docstrings)
- Include docstrings for all public functions, classes, and methods
- Use Google-style or NumPy-style docstrings
- Include Args and Returns sections
- Example:
```python
def calculate_growth_score(pct_change: float) -> int:
    """
    Calculates a Growth Potential score (1-100) based on price performance.

    Args:
        pct_change: Percentage change in stock price

    Returns:
        Growth score (1-100)
    """
    ...
```

### Error Handling
- Use try-except blocks for external API calls and file operations
- Return empty DataFrames or None on errors (not exceptions)
- Log warnings but don't crash on non-critical failures
- Example:
```python
try:
    result = some_operation()
except Exception as e:
    print(f"Warning: {e}")
    return pd.DataFrame()
```

### Class Design
- Use abstract base classes (`ABC`) for common functionality
- Implement template methods for shared behavior
- Use static methods for stateless utility functions
- Example:
```python
class AIClient(ABC):
    """Abstract base class for AI clients"""

    DEFAULT_MODEL: str | None = None

    @abstractmethod
    def _generate_content_impl(self, prompt: str, **kwargs) -> str:
        """Actual implementation required by subclasses"""
        pass
```

### Data Handling
- Use pandas DataFrames for tabular data
- Convert numpy types to Python native types for JSON serialization
- Handle missing data gracefully with `na=False` and `dropna()`
- Use proper column naming conventions

### File Structure
- Organize code by feature/functionality
- Keep related functions in the same module
- Use `__init__.py` to export public API
- Maintain clear separation between `app`, `api`, `database`, and `ui` folders

### API Development (api/ folder)
- Use FastAPI with Pydantic models for request/response validation
- Implement service layer (`api/services/`) to wrap `app` functionality
- Use async functions for I/O operations
- Include CORS middleware for frontend integration
- Return appropriate HTTP status codes
- Example:
```python
@router.get("/stocks/{ticker}")
async def get_stock(ticker: str) -> dict[str, Any]:
    """Get stock analysis for a specific ticker."""
    ...
```

## Important Constraints

### Read-Only Folders
- **app/** and **database/** folders are read-only
- Agents can only modify code in **api/** and **ui/** folders
- Agents may read from `app/` to create API wrappers around existing functionality
- Do not modify any files in `app/` or `database/` directly

### Workflow
1. Read existing code in `app/` to understand functionality
2. Create or modify API service wrappers in `api/services/`
3. Create API routes in `api/routes/`
4. Update frontend components in `ui/` if needed
5. Write tests for new functionality in `tests/`

### Testing
- Follow the existing test structure in `tests/`
- Use `unittest` framework
- Mock external dependencies (APIs, file I/O)
- Test both success and error cases
- Keep tests independent and focused

### Git Workflow
- Create meaningful commit messages
- Run tests before committing
- Never commit secrets or API keys
- Use feature branches for new functionality
