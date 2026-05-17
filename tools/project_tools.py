import os


def get_project_files(project_path: str):

    files_data = []

    for root, _, files in os.walk(project_path):

        for file in files:

            filepath = os.path.join(root, file)

            try:

                with open(
                    filepath,
                    "r",
                    encoding="utf-8"
                ) as f:

                    content = f.read()

                files_data.append({
                    "filename": file,
                    "filepath": filepath,
                    "content": content
                })

            except Exception:
                pass

    return files_data