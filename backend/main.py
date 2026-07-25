import asyncio
import os
from datetime import datetime

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from services import DocumentService, validate_pdf, validate_office_file

app = FastAPI(
    title="Document Converter API",
    version="2.0.0",
    description="PDF <-> Word/Excel/PowerPoint conversion backend for imagecompressor.cloud",
)

# CORS: the deployed frontend's production domain MUST be added here (via
# the CORS_ORIGINS env var below) or every request will be blocked by the
# browser — this is the #1 thing to get wrong when deploying.
default_origins = "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173"
allowed_origins = os.environ.get("CORS_ORIGINS", default_origins).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Conservative default for typical hobby/free-tier hosting (LibreOffice
# conversions are memory-heavy) — raise via env var if the host has more
# headroom.
MAX_FILE_SIZE_MB = int(os.environ.get("MAX_FILE_SIZE_MB", "50"))
MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024

# Per-conversion timeout — prevents a pathological file from hanging a
# worker indefinitely. LibreOffice itself times out at 120s internally
# (see document_service.py); this wraps every conversion, including
# pdf2docx/pdfplumber/PyMuPDF ones that have no internal timeout of their
# own.
CONVERSION_TIMEOUT_SECONDS = int(os.environ.get("CONVERSION_TIMEOUT_SECONDS", "150"))

MEDIA_TYPES = {
    "pdf": "application/pdf",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
}


@app.get("/api/health")
async def health_check():
    """Check if the server (and thus the frontend's production API URL) is
    reachable — used by the frontend to show a clear notice instead of a
    confusing failure if the backend isn't deployed/reachable."""
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0",
        "max_file_size_mb": MAX_FILE_SIZE_MB,
    }


async def _read_and_check_size(file: UploadFile) -> bytes:
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(400, f'"{file.filename}" is empty.')
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(413, f'"{file.filename}" exceeds the {MAX_FILE_SIZE_MB}MB limit.')
    return content


async def _run_conversion(coro, error_prefix: str):
    """Run a conversion with a hard timeout and consistent error handling.
    ValueError -> client's fault (400, e.g. corrupted/wrong file).
    TimeoutError -> conversion took too long (504).
    Anything else -> conversion library failure (500)."""
    try:
        return await asyncio.wait_for(coro, timeout=CONVERSION_TIMEOUT_SECONDS)
    except ValueError as e:
        raise HTTPException(400, str(e))
    except asyncio.TimeoutError:
        raise HTTPException(504, f"{error_prefix} timed out — the file may be too large or complex.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"{error_prefix}: {str(e)}")


def _stream_response(data: bytes, filename: str, media_type: str) -> StreamingResponse:
    return StreamingResponse(
        iter([data]),
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ============================================================================
# PDF -> Office
# ============================================================================

@app.post("/api/convert/pdf-to-word")
async def pdf_to_word(file: UploadFile = File(...)):
    content = await _read_and_check_size(file)
    validate_pdf(content, file.filename)
    docx_bytes = await _run_conversion(DocumentService.pdf_to_word(content), "PDF to Word conversion")
    return _stream_response(docx_bytes, "converted.docx", MEDIA_TYPES["docx"])


@app.post("/api/convert/pdf-to-excel")
async def pdf_to_excel(file: UploadFile = File(...)):
    content = await _read_and_check_size(file)
    validate_pdf(content, file.filename)
    xlsx_bytes = await _run_conversion(DocumentService.pdf_to_excel(content), "PDF to Excel conversion")
    return _stream_response(xlsx_bytes, "converted.xlsx", MEDIA_TYPES["xlsx"])


@app.post("/api/convert/pdf-to-pptx")
async def pdf_to_pptx(file: UploadFile = File(...)):
    content = await _read_and_check_size(file)
    validate_pdf(content, file.filename)
    pptx_bytes = await _run_conversion(DocumentService.pdf_to_pptx(content), "PDF to PowerPoint conversion")
    return _stream_response(pptx_bytes, "converted.pptx", MEDIA_TYPES["pptx"])


# ============================================================================
# Office -> PDF
# ============================================================================

@app.post("/api/convert/word-to-pdf")
async def word_to_pdf(file: UploadFile = File(...)):
    content = await _read_and_check_size(file)
    validate_office_file(content, file.filename, "docx")
    pdf_bytes = await _run_conversion(DocumentService.word_to_pdf(content), "Word to PDF conversion")
    return _stream_response(pdf_bytes, "converted.pdf", MEDIA_TYPES["pdf"])


@app.post("/api/convert/excel-to-pdf")
async def excel_to_pdf(file: UploadFile = File(...)):
    content = await _read_and_check_size(file)
    validate_office_file(content, file.filename, "xlsx")
    pdf_bytes = await _run_conversion(DocumentService.excel_to_pdf(content), "Excel to PDF conversion")
    return _stream_response(pdf_bytes, "converted.pdf", MEDIA_TYPES["pdf"])


@app.post("/api/convert/pptx-to-pdf")
async def pptx_to_pdf(file: UploadFile = File(...)):
    content = await _read_and_check_size(file)
    validate_office_file(content, file.filename, "pptx")
    pdf_bytes = await _run_conversion(DocumentService.pptx_to_pdf(content), "PowerPoint to PDF conversion")
    return _stream_response(pdf_bytes, "converted.pdf", MEDIA_TYPES["pdf"])


# ============================================================================
# Error handlers
# ============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "status_code": exc.status_code, "timestamp": datetime.now().isoformat()},
    )


@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    # Raised by validate_pdf()/validate_office_file() for bad uploads
    # (corrupted, encrypted, wrong format) — always the client's fault.
    return JSONResponse(
        status_code=400,
        content={"error": str(exc), "status_code": 400, "timestamp": datetime.now().isoformat()},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
