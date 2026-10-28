# 1. We import the calculation function and raw data from our previous file!
from timesheet_service import RAW_TIMESHEETS, calculate_salary

def find_employee(query_name):
    """
    Finds an employee by name, ignoring lowercase/uppercase differences.
    For example: 'satnam', 'Satnam', or 'Satnam Singh' will all match!
    """
    query = query_name.lower().strip()
    
    for emp in RAW_TIMESHEETS:
        # Check if the query word is inside the employee's full name
        if query in emp["name"].lower():
            return emp
            
    return None  # Return None if no employee matched


def get_employee_salary_summary(query_name, month="2026-10"):
    """
    Looks up an employee's timesheet, calculates their salary,
    and returns a clean, CEO-ready executive answer.
    """
    emp = find_employee(query_name)

    # 1. If employee not found, inform the CEO nicely
    if not emp:
        names = ", ".join([e["name"] for e in RAW_TIMESHEETS])
        return f"❌ Sorry, I could not find any employee matching '{query_name}'.\nAvailable employees on file: {names}"

    # 2. Run the deterministic math engine
    pay = calculate_salary(hours_worked=emp["hours"], hourly_rate=emp["hourly_rate"])

    # 3. Format the executive answer
    response = f"""
👤 EMPLOYEE PAYROLL BREAKDOWN
--------------------------------------------------
• Name:          {emp['name']} ({emp['role']})
• Period:        {month}
• Timesheet:     {emp['hours']} hrs logged ({emp['status']})
• Hourly Rate:   ${emp['hourly_rate']:.2f}/hr

⏱️ HOURS SPLIT:
• Regular Hours:  {pay['regular_hours']} hrs (${pay['regular_pay']:,.2f})
• Overtime Hours: {pay['overtime_hours']} hrs (${pay['overtime_pay']:,.2f} at 1.5x rate)

💰 FINAL DISBURSEMENT:
• Gross Salary:   ${pay['gross_salary']:,.2f}
• Tax Deduction: -${pay['tax_deduction']:,.2f} (10%)
--------------------------------------------------
✅ NET SALARY PAYABLE: ${pay['net_salary']:,.2f}
--------------------------------------------------
Summary: {emp['name']} worked {emp['hours']} hours this month. After deducting taxes, his net payout to be processed is ${pay['net_salary']:,.2f}.
"""
    return response


# =====================================================================
# INTERACTIVE CHAT LOOP FOR THE CEO
# =====================================================================
def run_cli_bot():
    print("\n" + "=" * 60)
    print("🤖 NUGENOVA EXECUTIVE PAYROLL ASSISTANT (For Varun Sharma)")
    print("Type an employee name (e.g. 'Satnam', 'Deepanshu', 'Jaspreet')")
    print("Type 'exit' or 'quit' to stop.")
    print("=" * 60 + "\n")

    while True:
        # Ask for input
        user_message = input("Varun > ")

        # Check if CEO wants to exit
        if user_message.lower().strip() in ["exit", "quit"]:
            print("👋 Goodbye!")
            break

        # If CEO entered nothing, ask again
        if not user_message.strip():
            continue

        # Check if the user mentioned any of our employees
        found_match = False
        for emp in RAW_TIMESHEETS:
            # Check if the employee's first name or full name is in the message
            first_name = emp["name"].split()[0].lower()
            if first_name in user_message.lower() or emp["name"].lower() in user_message.lower():
                answer = get_employee_salary_summary(emp["name"])
                print(answer)
                found_match = True
                break

        if not found_match:
            print(f"🤖 I didn't recognize an employee name in: '{user_message}'")
            print("👉 Try asking: 'tell me salary of Satnam' or 'Deepanshu'")
            print()


if __name__ == "__main__":
    run_cli_bot()