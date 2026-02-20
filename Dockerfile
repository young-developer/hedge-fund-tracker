FROM python:3.13-slim

WORKDIR /app

COPY Pipfile Pipfile.lock ./

RUN pip install pipenv && pipenv install --system

COPY api/requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY api ./api
COPY app ./app

CMD ["python", "-m", "api.main"]
