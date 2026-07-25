FROM python:3.11-slim

WORKDIR /app

# Only the LibreOffice components actually used (Writer/Calc/Impress ->
# PDF) rather than the full suite (Draw, Base, Math, etc.) — meaningfully
# smaller image and faster cold starts. Ghostscript/poppler were dropped:
# nothing in this backend uses them (PDF rendering now goes through
# PyMuPDF, a pure Python wheel with no system dependency).
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice-writer \
    libreoffice-calc \
    libreoffice-impress \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Zero-dependency healthcheck (the previous version called Python's
# `requests` module, which isn't a declared dependency, so it always
# failed).
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/health', timeout=5)" || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
