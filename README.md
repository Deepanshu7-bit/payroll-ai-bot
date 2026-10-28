# NuGenova Payroll Intelligence

An AI-powered executive payroll intelligence portal designed for **Varun Sharma (CEO of NuGenova)**. It automates monthly timesheet extraction, calculates deterministic salary disbursements (regular hours, 1.5x overtime, 10% tax deductions), and provides an interactive AI Chief of Staff assistant with 1-click PDF reporting.

---

## Architecture Overview

- **AI Brain:** Google Gemini 3.5 Flash with Autonomous Tool-Calling (`ai_agent.py`)
- **Backend Math & API:** Python 3.14 + FastAPI + Pydantic (`main.py`, `timesheet_service.py`)
- **Frontend Dashboard:** Next.js 16 (App Router) + Tailwind CSS + Lucide Icons + jsPDF (`frontend/`)
- **Automation / Ingestion:** Playwright browser automation with session persistence (`save_session.py`, `scrape_timesheet.py`)

---

## Quick Start Guide

### 1. Backend Setup (FastAPI & AI Agent)

1. Activate your virtual environment and install dependencies:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   # Add your Google Gemini API key to .env:
   # GEMINI_API_KEY=AIzaSy...
   ```

3. Launch the FastAPI backend server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   Interactive Swagger API docs will be available at: `http://localhost:8000/docs`

---

### 2. Frontend Setup (Next.js Dashboard)

In a separate terminal window:
```bash
cd frontend
npm install
npm run dev
```

Open your browser and navigate to:
👉 **`http://localhost:3000`**

---

## Features

- **Executive KPI Cards:** Real-time summary of Total Company Payout, Total Hours Logged, Overtime Hours, and Active Team Members.
- **Searchable Payroll Table:** Complete employee list with exact regular hours, overtime hours, tax deductions, and net payable salaries.
- **AI Chief of Staff Assistant:** Varun Sharma can ask natural language questions (e.g. *"Why is Satnam's salary higher than Abhishek?"*, *"Did anyone log low hours?"*). The AI autonomously queries deterministic Python tools to deliver exact, hallucination-free financial advice.
- **1-Click PDF Report:** Downloads an executive Landscape A4 report formatted for bank disbursement and accounting.
- **Stop Generation & Prompt Recovery:** Cancel queries mid-generation with zero lag and automatic prompt preservation.
- **Persistent Chat History:** Stored in browser `localStorage` across reloads.
- **Dark / Light Mode:** Instant theme toggle.

---

## Security & Compliance

- **No Secrets in Source:** All API keys and browser session states (`.env`, `auth_state.json`) are strictly excluded from version control via `.gitignore`.
- **Zero Calculation Hallucinations:** The LLM is never allowed to do mental math; all calculations are executed deterministically in pure Python before being returned to the user.
