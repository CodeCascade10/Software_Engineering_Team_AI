import re
from dataclasses import dataclass
from pathlib import PurePosixPath


FILE_BLOCK = re.compile(
    r"^FILE:\s*(?P<name>[^\r\n]+)\s*\r?\n"
    r"```[^\r\n]*\r?\n(?P<content>.*?)^```[ \t]*$",
    re.MULTILINE | re.DOTALL,
)
FILE_MARKER = re.compile(r"^FILE:", re.MULTILINE)
MAX_GENERATED_FILES = 40
MAX_GENERATED_CONTENT_CHARS = 1_500_000


@dataclass
class FileOutputError(ValueError):
    code: str
    details: str

    def __str__(self):
        return f"{self.code}: {self.details}"


def normalize_file_path(raw_path: str) -> str:
    if "\x00" in raw_path:
        raise FileOutputError("null_byte", "File paths cannot contain null bytes")
    if "\\" in raw_path:
        raise FileOutputError("backslash_path", "Backslashes are not allowed in generated paths")
    path = raw_path.strip()
    if path.startswith("/"):
        raise FileOutputError("absolute_path", f"Absolute path is not allowed: {path}")
    while path.startswith("./"):
        path = path[2:]
    parts = [part for part in path.split("/") if part]
    if not parts or any(part in {".", ".."} for part in parts):
        raise FileOutputError("unsafe_path", f"Unsafe generated path: {raw_path}")
    if ":" in parts[0]:
        raise FileOutputError("drive_path", f"Drive-prefixed path is not allowed: {raw_path}")
    normalized = PurePosixPath(*parts).as_posix()
    if normalized in {"", "."}:
        raise FileOutputError("empty_path", "Generated file path is empty")
    return normalized


def extract_generated_files(response_text: str) -> list[dict[str, str]]:
    """Parse every declared file block or reject the complete model response."""
    matches = list(FILE_BLOCK.finditer(response_text))
    declared_count = len(FILE_MARKER.findall(response_text))
    if not matches or declared_count != len(matches):
        raise FileOutputError("malformed_block", "Every FILE declaration must have one complete fenced block")

    files = []
    seen = set()
    total_chars = 0
    for match in matches:
        name = normalize_file_path(match.group("name"))
        key = name.casefold()
        if key in seen:
            raise FileOutputError("duplicate_path", f"Duplicate generated path: {name}")
        seen.add(key)
        content = match.group("content").strip()
        if not content:
            raise FileOutputError("empty_content", f"Generated file is empty: {name}")
        total_chars += len(content)
        if len(files) + 1 > MAX_GENERATED_FILES:
            raise FileOutputError("file_limit", f"More than {MAX_GENERATED_FILES} files were returned")
        if total_chars > MAX_GENERATED_CONTENT_CHARS:
            raise FileOutputError("size_limit", f"Generated content exceeds {MAX_GENERATED_CONTENT_CHARS} characters")
        files.append({"file_name": name, "content": content})
    return files
