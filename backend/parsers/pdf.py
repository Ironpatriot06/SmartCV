import fitz


def _line_text(line: dict) -> str:
    return "".join(span.get("text", "") for span in line.get("spans", [])).strip()


def extract_text(file_path: str) -> str:
    """Extract text from every page of a PDF file, appending embedded link URLs."""
    doc = fitz.open(file_path)
    try:
        pages: list[str] = []
        for page in doc:
            page_dict = page.get_text("dict")
            links = [link for link in page.get_links() if link.get("uri")]
            link_rects = [
                (fitz.Rect(link["from"]), link["uri"])
                for link in links
                if link.get("from")
            ]
            page_lines: list[str] = []

            for block in page_dict.get("blocks", []):
                if block.get("type") != 0:
                    continue
                block_lines: list[str] = []
                for line in block.get("lines", []):
                    text = _line_text(line)
                    if not text:
                        continue
                    line_rect = fitz.Rect(line.get("bbox", (0, 0, 0, 0)))
                    urls: list[str] = []
                    for rect, uri in link_rects:
                        if line_rect.intersects(rect) and uri not in urls:
                            urls.append(uri)
                    if urls:
                        for uri in urls:
                            if uri not in text:
                                text = f"{text} ({uri})"
                    block_lines.append(text)
                if block_lines:
                    page_lines.extend(block_lines)
                    page_lines.append("")

            for _, uri in link_rects:
                if not any(uri in line for line in page_lines):
                    page_lines.append(uri)

            while page_lines and not page_lines[-1].strip():
                page_lines.pop()
            pages.append("\n".join(page_lines).strip())
    finally:
        doc.close()
    return "\n\n".join(page for page in pages if page)
