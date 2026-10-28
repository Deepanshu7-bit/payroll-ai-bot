from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import our timesheet service and the new Gemini AI Agent!
from timesheet_service import get_ceo_kpis, get_monthly_payroll, RAW_TIMESHEETS
from salary_bot import get_employee_salary_summary
from ai_agent import ask_ceo_ai

# 1. Initialize the FastAPI application
app = FastAPI(title="NuGenova Payroll Intelligence API - Varun Sharma")

# 2. CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Pydantic Model
class ChatRequest(BaseModel):
    message: str


# =====================================================================
# ENDPOINT 1: CEO KPI Metrics (For the top cards)
# =====================================================================
@app.get("/api/kpis")
def get_kpis(month: str = "2026-10"):
    """Returns total payout, total hours, and employee count."""
    return get_ceo_kpis(month=month)


# =====================================================================
# ENDPOINT 2: All Employees Payroll Table (For the main table)
# =====================================================================
@app.get("/api/payroll")
def get_payroll_table(month: str = "2026-10"):
    """Returns the full list of employees and their salary breakdowns."""
    return get_monthly_payroll(month=month)


# =====================================================================
# ENDPOINT 3: REAL AI AGENT CHAT ENDPOINT (Powered by Gemini + Tools)
# =====================================================================
@app.post("/api/chat")
def chat_with_bot(request: ChatRequest):
    """
    Receives ANY natural language question from the CEO.
    Gemini reasons, calls our Python calculation tools, and returns
    an executive-level financial analysis!
    """
    user_msg = request.message.strip()
    if not user_msg:
        return {"reply": "Please ask a question regarding timesheets or payroll."}

    # 1. Send to the real Gemini AI Agent
    ai_reply = ask_ceo_ai(user_msg)

    # If successful, return the AI's intelligent answer
    if ai_reply and not ai_reply.startswith("Error"):
        return {"reply": ai_reply}

    # 2. Fallback: If AI API fails or reaches quota, use local engine
    for emp in RAW_TIMESHEETS:
        first_name = emp["name"].split()[0].lower()
        if first_name in user_msg.lower():
            return {"reply": get_employee_salary_summary(emp["name"])}

    kpis = get_ceo_kpis("2026-10")
    return {
        "reply": (
            f"📊 Executive Summary ({kpis['month']}): Total Payout ${kpis['total_payout']:,.2f} "
            f"across {kpis['total_employees']} employees ({kpis['total_hours']} total hours)."
        )
    }
