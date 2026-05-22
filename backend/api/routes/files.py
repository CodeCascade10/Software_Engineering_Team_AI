from fastapi import APIRouter
import os

import zipfile

from fastapi.responses import FileResponse

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

        return {
            "files": []
        }

    for file_name in os.listdir(project_path):

        file_path = os.path.join(
            project_path,
            file_name
        )

        if os.path.isfile(file_path):

            with open(
                file_path,
                "r",
                encoding="utf-8"
            ) as f:

                content = f.read()

            files_data.append({

                "name": file_name,

                "content": content

            })

    return {
        "files": files_data
    }

@router.get("/download/{project_id}")

def download_project(project_id: str):

    project_path = BASE_DIR

    zip_path = f"{project_id}.zip"

    with zipfile.ZipFile(

        zip_path,
        "w",
        zipfile.ZIP_DEFLATED

    ) as zipf:

        for file_name in os.listdir(project_path):

            file_path = os.path.join(
                project_path,
                file_name
            )

            if os.path.isfile(file_path):

                zipf.write(
                    file_path,
                    arcname=file_name
                )

    return FileResponse(

        path=zip_path,

        filename=f"{project_id}.zip",

        media_type="application/zip"
    )