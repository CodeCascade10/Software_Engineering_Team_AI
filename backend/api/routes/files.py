from fastapi import APIRouter
import os

router = APIRouter(
    prefix="/files",
    tags=["Files"]
)

BASE_DIR = "generated_projects/generated_backend"


@router.get("/{project_id}")

def get_generated_files(project_id: str):

    project_path = BASE_DIR

    files_data = []

    if not os.path.exists(project_path):

        return []

    for file_name in os.listdir(project_path):

        file_path = os.path.join(
            project_path,
            file_name
        )

        if os.path.isfile(file_path):

            with open(file_path, "r") as f:

                content = f.read()

            files_data.append({

                "file_name": file_name,
                "content": content

            })

    return files_data