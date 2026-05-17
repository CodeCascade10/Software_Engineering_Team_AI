import subprocess


def run_python_file(filepath: str):

    try:

        result = subprocess.run(
            ["python3", filepath],
            capture_output=True,
            text=True,
            timeout=20
        )

        return {
            "success": result.returncode == 0,
            "stdout": result.stdout,
            "stderr": result.stderr
        }

    except Exception as e:

        return {
            "success": False,
            "stdout": "",
            "stderr": str(e)
        }


def install_requirements(requirements_path: str):

    try:

        result = subprocess.run(
            [
                "pip",
                "install",
                "-r",
                requirements_path
            ],
            capture_output=True,
            text=True,
            timeout=120
        )

        return {
            "success": result.returncode == 0,
            "stdout": result.stdout,
            "stderr": result.stderr
        }

    except Exception as e:

        return {
            "success": False,
            "stdout": "",
            "stderr": str(e)
        }
def run_fastapi_server():

    try:

        result = subprocess.run(
            [
                "python3",
                "-m",
                "uvicorn",
                "generated_projects.generated_backend.main:app",
                "--host",
                "127.0.0.1",
                "--port",
                "8000"
            ],
            capture_output=True,
            text=True,
            timeout=15
        )

        return {
            "success": result.returncode == 0,
            "stdout": result.stdout,
            "stderr": result.stderr
        }

    except subprocess.TimeoutExpired:

        return {
            "success": True,
            "stdout": "FastAPI server started successfully.",
            "stderr": ""
        }

    except Exception as e:

        return {
            "success": False,
            "stdout": "",
            "stderr": str(e)
        }