import pytest

from agents.file_output import (
    MAX_GENERATED_CONTENT_CHARS,
    MAX_GENERATED_FILES,
    FileOutputError,
    extract_generated_files,
)


def block(name, content="x"):
    return f"FILE: {name}\n```text\n{content}\n```"


def test_parses_multiple_files_and_normalizes_leading_dot_slash():
    files = extract_generated_files(block("./src//App.jsx", "const App = () => null;") + "\n" + block("package.json", "{}"))
    assert [item["file_name"] for item in files] == ["src/App.jsx", "package.json"]


@pytest.mark.parametrize("response", [
    "FILE: app.py\n```py\nprint('unterminated')",
    block("good.py") + "\nFILE: broken.py",
    block("empty.py", "   "),
])
def test_rejects_entire_response_when_any_block_is_malformed_or_empty(response):
    with pytest.raises(FileOutputError):
        extract_generated_files(response)


@pytest.mark.parametrize("path", ["../x", "/etc/passwd", "a/../../b", r"a\\..\\b", "C:/secret", "a\x00b"])
def test_rejects_unsafe_paths(path):
    with pytest.raises(FileOutputError):
        extract_generated_files(block(path))


@pytest.mark.parametrize("response", [
    block("src/App.jsx") + "\n" + block("src/App.jsx"),
    block("src/App.jsx") + "\n" + block("SRC/app.JSX"),
])
def test_rejects_duplicate_paths_case_insensitively(response):
    with pytest.raises(FileOutputError, match="duplicate_path"):
        extract_generated_files(response)


def test_enforces_file_count_and_content_limits(monkeypatch):
    import agents.file_output as parser

    monkeypatch.setattr(parser, "MAX_GENERATED_FILES", 1)
    with pytest.raises(FileOutputError, match="file_limit"):
        parser.extract_generated_files(block("a", "x") + "\n" + block("b", "y"))
    monkeypatch.setattr(parser, "MAX_GENERATED_FILES", MAX_GENERATED_FILES)
    monkeypatch.setattr(parser, "MAX_GENERATED_CONTENT_CHARS", 2)
    with pytest.raises(FileOutputError, match="size_limit"):
        parser.extract_generated_files(block("a", "xxx"))
    assert MAX_GENERATED_CONTENT_CHARS > 2
