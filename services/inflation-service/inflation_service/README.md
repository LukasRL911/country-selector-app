# Run instructions for backend (ensure Pydantic v1 / Python <= 3.11)

This project uses Pydantic v1 (not compatible with Pydantic v2+). Do not run the app with Python 3.14 or another Python >= 3.12+ that has caused compatibility problems in your environment.

**Quick notes**
- Working directory for these commands: `backend` (where `controller.py` lives).
- If you already have a `venv` in this folder that points to Python 3.14 (see `venv/pyvenv.cfg`), do not activate it. Create a new venv using Python 3.11.

**1) Create a Python 3.11 venv (PowerShell)**

```powershell
# Recommended: use the py launcher to target 3.11
py -3.11 -m venv .\venv311

# Or if you have a python3.11 executable available:
# python3.11 -m venv .\venv311
```

**2) Activate the venv**

```powershell
.\venv311\Scripts\Activate.ps1
```

**3) Verify Python version and upgrade pip**

```powershell
python --version
python -m pip install --upgrade pip
```

**4) Install dependencies (pins Pydantic to v1)**

```powershell
python -m pip install -r .\requirements.txt
```

If you prefer explicit install commands instead of the requirements file:

```powershell
python -m pip install "fastapi" "uvicorn[standard]" "pydantic<2"
```

**5) Run the app (development)**

```powershell
# Run with auto-reload while developing
python -m uvicorn controller:app --reload --host 127.0.0.1 --port 8000

# Or call the uvicorn.exe from the venv directly:
.\venv311\Scripts\uvicorn.exe controller:app --reload --host 127.0.0.1 --port 8000
```

`controller:app` assumes your FastAPI instance is named `app` in `controller.py`. If it has a different variable name, replace `app` accordingly.

**6) Production example (no reload, bind to all interfaces)**

```powershell
python -m uvicorn controller:app --host 0.0.0.0 --port 8000 --workers 4
```

Notes on the existing `venv` found in this repo:
- I noticed an existing `venv` pointing at Python 3.14 recorded in `venv/pyvenv.cfg`. Do not activate that venv if you need Pydantic v1. You can remove it if you no longer need it:

```powershell
# OPTIONAL: delete old venv (only if you really want to remove it)
Remove-Item -Recurse -Force .\venv
```

If you want, I can also create a small `backend/.env` or a PowerShell script with these commands—tell me which you prefer.
