import json
import sys
from pathlib import Path

from pypdf import PdfReader


def main() -> None:
    path = Path(sys.argv[1])
    reader = PdfReader(str(path))
    pages = []
    for number, page in enumerate(reader.pages, start=1):
        try:
            text = page.extract_text() or ""
        except Exception:
            text = ""
        text = " ".join(text.replace("\x00", " ").split())
        pages.append({"page": number, "text": text})

    result = {
        "page_count": len(reader.pages),
        "pages_with_text": sum(1 for page in pages if page["text"]),
        "pages": pages,
    }
    sys.stdout.reconfigure(encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
