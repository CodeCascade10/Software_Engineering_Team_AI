import os
import zipfile


def zip_project_folder(
    folder_path: str,
    output_path: str
):

    with zipfile.ZipFile(
        output_path,
        "w",
        zipfile.ZIP_DEFLATED
    ) as zipf:

        for root, _, files in os.walk(folder_path):

            for file in files:

                filepath = os.path.join(
                    root,
                    file
                )

                arcname = os.path.relpath(
                    filepath,
                    folder_path
                )

                zipf.write(
                    filepath,
                    arcname
                )

    return output_path