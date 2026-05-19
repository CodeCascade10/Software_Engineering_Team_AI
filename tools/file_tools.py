import os


def save_file(filepath: str, content: str):

    directory = os.path.dirname(filepath)

    if directory:

        os.makedirs(
            directory,
            exist_ok=True
        )

    with open(
        filepath,
        "w",
        encoding="utf-8"
    ) as file:

        file.write(content)


def append_log(message: str):

    os.makedirs(
        "logs/workflow_logs",
        exist_ok=True
    )

    with open(
        "logs/workflow_logs/system.log",
        "a",
        encoding="utf-8"
    ) as file:

        file.write(message + "\n")
def read_logs():

    try:

        with open(
            "logs/workflow_logs/system.log",
            "r",
            encoding="utf-8"
        ) as file:

            return file.read()

    except FileNotFoundError:

        return ""
    
def save_docker_files():

    dockerfile_content = """
FROM python:3.12-slim

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
"""

    docker_compose_content = """
version: '3.9'

services:

  backend:

    build: .

    container_name: ai_generated_backend

    ports:
      - "8000:8000"
"""

    save_file(
        "generated_projects/generated_backend/Dockerfile",
        dockerfile_content.strip()
    )

    save_file(
        "generated_projects/generated_backend/docker-compose.yml",
        docker_compose_content.strip()
    )

def save_cicd_files():

    github_actions = """
name: AI Generated CI Pipeline

on:

  push:
    branches:
      - main

  pull_request:
    branches:
      - main

jobs:

  build:

    runs-on: ubuntu-latest

    steps:

      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5

        with:
          python-version: '3.12'

      - name: Install Dependencies
        run: |
          pip install -r generated_backend/requirements.txt

      - name: Run Backend Validation
        run: |
          python generated_backend/main.py
"""

    save_file(
        "generated_projects/.github/workflows/ci.yml",
        github_actions.strip()
    )

def save_render_config():

    render_yaml = """
services:

  - type: web
    name: ai-generated-backend

    env: docker

    plan: free

    autoDeploy: true
"""

    save_file(
        "generated_projects/render.yaml",
        render_yaml.strip()
    )