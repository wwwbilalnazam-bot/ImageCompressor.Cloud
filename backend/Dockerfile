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
# failed). Reads $PORT so it matches whatever port the app actually binds
# to below (hosts like Railway assign this dynamically at runtime).
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD python -c "import os, urllib.request; urllib.request.urlopen('http://localhost:' + os.environ.get('PORT', '8000') + '/api/health', timeout=5)" || exit 1

# Shell form (not exec/array form) so $PORT is expanded at container start —
# hosts like Railway inject their own PORT and route to it; hardcoding 8000
# here caused the platform's edge proxy to get a connection refused/502
# even though the app itself started and logged successfully.
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
