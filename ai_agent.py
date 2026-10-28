import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

from timesheet_service import RAW_TIMESHEETS, calculate_salary, get_ceo_kpis, get_monthly_payroll

# 1. Load the Gemini API key from .env
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

client = None
if api_key:
    client = genai.Client(api_key=api_key)


# =====================================================================
# TOOLS PROVIDED TO THE AI AGENT (Deterministic Math Functions)
# =====================================================================

def get_employee_salary_details(employee_name: str) -> dict:
    """
    Looks up an employee by name from NuGenova timesheets and returns their
    logged hours, hourly rate, overtime hours, gross pay, tax deduction, and net pay.
    """
    query = employee_name.lower().strip()
    for emp in RAW_TIMESHEETS:
        if query in emp["name"].lower():
            pay = calculate_salary(emp["hours"], emp["hourly_rate"])
            return {
                "found": True,
                "name": emp["name"],
                "role": emp["role"],
                "month": emp["month"],
                "hours_logged": emp["hours"],
                "hourly_rate": emp["hourly_rate"],
                **pay
            }
    available = [e["name"] for e in RAW_TIMESHEETS]
    return {"found": False, "message": f"Employee '{employee_name}' not found. Available: {available}"}


def get_company_payroll_overview(month: str = "2026-10") -> dict:
    """
    Returns company-wide executive metrics: total payout, total hours worked,
    total overtime hours, and an overview of all employees.
    """
    kpis = get_ceo_kpis(month)
    all_records = get_monthly_payroll(month)
    return {
        "kpis": kpis,
        "employees": [
            {
                "name": r["name"],
                "role": r["role"],
                "hours": r["hours_logged"],
                "overtime": r["overtime_hours"],
                "net_salary": r["net_salary"]
            }
            for r in all_records
        ]
    }


def flag_payroll_anomalies() -> dict:
    """
    Analyzes all timesheets and flags irregularities such as:
    - Employees with low hours (< 140 hrs)
    - Employees with high overtime (> 8 hrs)
    """
    all_records = get_monthly_payroll("2026-10")
    low_hours = []
    high_overtime = []

    for r in all_records:
        if r["hours_logged"] < 140:
            low_hours.append({
                "name": r["name"],
                "hours": r["hours_logged"],
                "deficit": round(160 - r["hours_logged"], 2)
            })
        if r["overtime_hours"] > 8:
            high_overtime.append({
                "name": r["name"],
                "overtime_hours": r["overtime_hours"],
                "overtime_cost": r["overtime_pay"]
            })

    return {
        "low_hours_flagged": low_hours,
        "high_overtime_flagged": high_overtime
    }


# =====================================================================
# THE AI AGENT ORCHESTRATOR
# =====================================================================

SYSTEM_INSTRUCTION = """
You are the Executive AI Chief of Staff and Financial Advisor to Varun Sharma, CEO of NuGenova.
You have access to real-time company timesheet and payroll tools.

RULES FOR YOUR RESPONSES:
1. ALWAYS call the provided tools to fetch real facts and calculations before answering.
2. NEVER guess or do mental arithmetic for salary numbers—rely 100% on the numbers returned by the tools.
3. Be concise, professional, and address Varun Sharma respectfully by name when appropriate.
4. When comparing employees or explaining differences, explain the root cause (e.g. hourly rate differences, overtime hours, or missing logged hours).
5. FORMATTING RULE: Write clean, executive-level text. Do NOT use markdown stars or asterisks (no `**` or `*`). Use clean bullet points (•) and clean headings with line breaks.
"""

def ask_ceo_ai(question: str) -> str:
    """
    Sends the CEO's natural language question to Gemini with automatic tool calling.
    """
    if not client:
        return "⚠️ Gemini API key is not configured in .env. Please add GEMINI_API_KEY."

    try:
        chat = client.chats.create(
            model="gemini-3.5-flash-lite",
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                tools=[
                    get_employee_salary_details,
                    get_company_payroll_overview,
                    flag_payroll_anomalies
                ],
                temperature=0.2,
            ),
        )
        response = chat.send_message(question)
        return response.text
    except Exception as e:
        return f"Error contacting AI model: {str(e)}"


if __name__ == "__main__":
    test_question = "Why is Satnam's salary higher than Abhishek, and did anyone log low hours this month?"
    print(f"\nCEO Question: '{test_question}'\n")
    print("🤖 Thinking and querying tools...")
    answer = ask_ceo_ai(test_question)
    print("\n" + "=" * 60)
    print("AI RESPONSE:")
    print("=" * 60)
    print(answer)
