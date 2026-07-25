# Document Converter Backend

Real PDF ↔ Word/Excel/PowerPoint conversion API for imagecompressor.cloud's
File Converter page. Every other conversion on the site (images, PDF→JPG/PNG,
text/images→PDF) runs entirely in the browser and doesn't need this service —
this backend exists specifically because genuine Office-format fidelity isn't
achievable client-side.

- **PDF → Word/Excel** use [`pdf2docx`](https://github.com/dothinking/pdf2docx)
  and `pdfplumber` to reconstruct real layout — text position, tables, images —
  not plain text extraction.
- **PDF → PowerPoint** renders each page as a high-resolution image and places
  it full-bleed on its own slide (via PyMuPDF + `python-pptx`). This preserves
  exact visual appearance; slide content is **not** individually editable text
  — PDFs have no native slide/shape structure to reconstruct from, and that's
  a realistic, honest scope without building a much larger layout-inference
  engine.
- **Word/Excel/PowerPoint → PDF** shell out to LibreOffice headless, which is
  the only open-source approach that reliably preserves fonts, styles and
  layout for arbitrary Office documents.

## Local setup

**Prerequisites:** Python 3.11+ and LibreOffice (must be reachable as `soffice`
on your `PATH`, or set `LIBREOFFICE_PATH` — see `.env.example`). Ghostscript
is **not** required (this was true of an older version of this backend; PDF
rendering now goes through PyMuPDF, a pure-Python wheel).

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then edit CORS_ORIGINS for your setup
python main.py                  # runs on http://localhost:8000
```

Verify it's up: `curl http://localhost:8000/api/health`

## API

All endpoints accept a single `multipart/form-data` file upload under the
field name `file` and stream back the converted file.

| Endpoint | Input | Output |
|---|---|---|
| `POST /api/convert/pdf-to-word` | `.pdf` | `.docx` |
| `POST /api/convert/pdf-to-excel` | `.pdf` | `.xlsx` |
| `POST /api/convert/pdf-to-pptx` | `.pdf` | `.pptx` |
| `POST /api/convert/word-to-pdf` | `.docx` | `.pdf` |
| `POST /api/convert/excel-to-pdf` | `.xlsx` | `.pdf` |
| `POST /api/convert/pptx-to-pdf` | `.pptx` | `.pdf` |
| `GET /api/health` | — | `{"status": "ok", ...}` |

Errors return JSON: `{"error": "...", "status_code": 400|413|500|504, "timestamp": "..."}`.
`400` = bad/corrupted/wrong-format upload, `413` = over the size limit,
`504` = conversion timed out, `500` = the conversion library itself failed.

## Privacy / file handling

No file is ever written outside a per-request temporary directory
(`tempfile.TemporaryDirectory()`), which is deleted automatically the moment
the conversion finishes or fails — nothing persists between requests, and
nothing is retained after the response is sent.

## Deploying (Railway)

This is written for Railway specifically because the Dockerfile here
(LibreOffice + Python) needs a host that builds from a Dockerfile — a plain
buildpack-based host won't have LibreOffice available.

1. **Push this repo to GitHub** if it isn't already (Railway deploys from a
   repo).
2. **Create a new Railway project** → "Deploy from GitHub repo" → select this
   repo. When it asks for a root directory / build context, point it at
   `backend/` (Railway should auto-detect the `Dockerfile` there).
3. **Set environment variables** in Railway's project settings (see
   `.env.example` for the full list) — at minimum:
   - `CORS_ORIGINS` — **must include your real production frontend domain**,
     e.g. `https://imagecompressor.cloud`. Without this, the browser will
     block every request with a CORS error even though the backend itself is
     up and healthy.
   - `MAX_FILE_SIZE_MB` — defaults to `50`; raise it if your Railway plan has
     more RAM headroom (LibreOffice/pdf2docx conversions are memory-heavy).
4. **Deploy** and wait for the build (installing LibreOffice takes a few
   minutes the first time). Confirm it's live:
   `curl https://<your-railway-app>.up.railway.app/api/health`
5. **Note the deployed URL** — you need it for the next step.

### The step that's easy to miss: telling the frontend where the backend is

Deploying the backend alone does **nothing** for the live site — the frontend
resolves its backend URL from the `VITE_API_URL` environment variable at
**build time**, and if it's unset, it silently falls back to
`http://localhost:8000/api` (unreachable from a real visitor's browser, so
every Office conversion would fail with a generic network error).

In your **Vercel project settings** (not just a local `.env.local` file, which
only affects your own machine) → Environment Variables → add:

```
VITE_API_URL = https://<your-railway-app>.up.railway.app/api
```

Then redeploy the frontend (Vercel needs a new build to pick up the env var
change). After that, Office-document conversions on the live site will
actually reach the deployed backend.

### Docker (self-hosted alternative)

```bash
docker build -t document-converter-backend .
docker run -p 8000:8000 -e CORS_ORIGINS=https://imagecompressor.cloud document-converter-backend
```

`docker-compose.yml` is for local development only (live-reloads on file
changes) — don't use it as-is in production.

## Known limitations

- **PDF → PowerPoint produces visual, not editable, slides** (see above) —
  by design, not a bug.
- **Timeouts don't forcibly kill in-progress work.** The API layer times out
  a hung request (`CONVERSION_TIMEOUT_SECONDS`, default 150s) and LibreOffice
  subprocess calls are killed on their own internal timeout, but a pdf2docx/
  pdfplumber conversion that's still running in a worker thread when the API
  times out keeps consuming CPU in the background until it finishes on its
  own. In practice the file-size limit keeps worst-case processing time
  bounded; a fully interruptible version would need process-based (not
  thread-based) execution, which is a larger change.
- **Single-instance, no queue.** Under real concurrent load from many users,
  LibreOffice conversions in particular are CPU/memory-heavy; scaling past a
  single hobby-tier instance would need a task queue (e.g. Celery/RQ) rather
  than handling conversions inline in the request — not built here, flagged
  for when traffic actually warrants it.
