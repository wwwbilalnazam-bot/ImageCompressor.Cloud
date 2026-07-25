from io import BytesIO

import pikepdf


def validate_pdf(content: bytes, filename: str = "file") -> None:
    """Open the PDF with pikepdf to catch corruption/encryption early with a
    clear message, before handing it to a heavier converter that would
    otherwise fail deep inside third-party code with a confusing error."""
    if not content.startswith(b"%PDF"):
        raise ValueError(f'"{filename}" is not a valid PDF file.')

    try:
        with pikepdf.open(BytesIO(content)) as pdf:
            if len(pdf.pages) == 0:
                raise ValueError(f'"{filename}" has no pages.')
    except pikepdf.PasswordError:
        raise ValueError(f'"{filename}" is password-protected. Remove the password and try again.')
    except pikepdf.PdfError:
        raise ValueError(f'"{filename}" appears to be corrupted or is not a supported PDF.')


def validate_office_file(content: bytes, filename: str, expected_ext: str) -> None:
    """Basic sanity check for .docx/.xlsx/.pptx uploads — all three formats
    are ZIP archives under the hood, so a valid file must start with a ZIP
    local-file-header signature ("PK")."""
    if not filename.lower().endswith(f".{expected_ext}"):
        raise ValueError(f'"{filename}" must be a .{expected_ext} file.')
    if not content.startswith(b"PK"):
        raise ValueError(f'"{filename}" appears to be corrupted or is not a valid .{expected_ext} file.')


def format_bytes(bytes_value: int) -> str:
    """Format bytes to human readable form, used in log/error messages."""
    value = float(bytes_value)
    for unit in ["B", "KB", "MB", "GB"]:
        if value < 1024.0:
            return f"{value:.2f} {unit}"
        value /= 1024.0
    return f"{value:.2f} TB"
