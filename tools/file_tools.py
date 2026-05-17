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

    with open(
        "logs/workflow_logs/system.log",
        "a",
        encoding="utf-8"
    ) as file:

        file.write(message + "\n")