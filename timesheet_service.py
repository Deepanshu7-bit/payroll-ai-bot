# =====================================================================
# 1. MOCK DATABASE (Modeled directly from your CEO's screenshot!)
# =====================================================================
RAW_TIMESHEETS = [
    {
        "id": "EMP-001",
        "name": "Deepanshu Dhingra",
        "role": "Software Engineer",
        "month": "2026-10",
        "hours": 180.44,
        "hourly_rate": 35.0,
        "status": "Approved"
    },
    {
        "id": "EMP-002",
        "name": "Riya Mahajan",
        "role": "Graphic Designer",
        "month": "2026-10",
        "hours": 175.44,
        "hourly_rate": 35.0,
        "status": "Approved"
    },
    {
        "id": "EMP-003",
        "name": "Jaspreet Kaur",
        "role": "QA Engineer",
        "month": "2026-10",
        "hours": 165.50,
        "hourly_rate": 30.0,
        "status": "Approved"
    },
    {
        "id": "EMP-004",
        "name": "Abhishek Sharma",
        "role": "Product Designer",
        "month": "2026-10",
        "hours": 152.00,
        "hourly_rate": 40.0,
        "status": "Approved"
    },
    {
        "id": "EMP-005",
        "name": "Satnam Singh",
        "role": "DevOps Engineer",
        "month": "2026-10",
        "hours": 170.00,
        "hourly_rate": 45.0,
        "status": "Approved"
    },
    {
        "id": "EMP-006",
        "name": "Arshdeep Kaur",
        "role": "HR Specialist",
        "month": "2026-10",
        "hours": 160.00,
        "hourly_rate": 28.0,
        "status": "Approved"
    }
]

# =====================================================================
# 2. SALARY CALCULATION FUNCTION
# =====================================================================
def calculate_salary(hours_worked, hourly_rate, standard_hours=160):
    """Calculates gross pay, overtime, 10% tax deduction, and net pay."""
    if hours_worked > standard_hours:
        overtime_hours = hours_worked - standard_hours
        regular_hours = standard_hours
    else:
        overtime_hours = 0.0
        regular_hours = hours_worked

    regular_pay = regular_hours * hourly_rate
    overtime_pay = overtime_hours * (hourly_rate * 1.5)  # 1.5x overtime rate
    gross_salary = regular_pay + overtime_pay

    # Deductions: 10% tax
    tax_deduction = gross_salary * 0.10
    net_salary = gross_salary - tax_deduction

    return {
        "regular_hours": round(regular_hours, 2),
        "overtime_hours": round(overtime_hours, 2),
        "regular_pay": round(regular_pay, 2),
        "overtime_pay": round(overtime_pay, 2),
        "gross_salary": round(gross_salary, 2),
        "tax_deduction": round(tax_deduction, 2),
        "net_salary": round(net_salary, 2)
    }

# =====================================================================
# 3. GET FULL PAYROLL FOR A GIVEN MONTH (For the Next.js Table)
# =====================================================================
def get_monthly_payroll(month="2026-10"):
    """Returns all employee payroll records for the requested month."""
    payroll_records = []

    for item in RAW_TIMESHEETS:
        if item["month"] == month:
            # Calculate salary using our math function
            pay = calculate_salary(item["hours"], item["hourly_rate"])

            # Merge employee info with the calculated numbers
            record = {
                "id": item["id"],
                "name": item["name"],
                "role": item["role"],
                "month": item["month"],
                "status": item["status"],
                "hours_logged": item["hours"],
                "hourly_rate": item["hourly_rate"],
                **pay  # This spreads pay dictionary fields (just like ...pay in JS!)
            }
            payroll_records.append(record)

    return payroll_records

# =====================================================================
# 4. GET CEO EXECUTIVE KPIS (For the Dashboard Top Cards)
# =====================================================================
def get_ceo_kpis(month="2026-10"):
    """Calculates summary metrics for the executive dashboard."""
    records = get_monthly_payroll(month)

    total_payout = 0.0
    total_hours = 0.0
    total_overtime_hours = 0.0

    for r in records:
        total_payout += r["net_salary"]
        total_hours += r["hours_logged"]
        total_overtime_hours += r["overtime_hours"]

    return {
        "month": month,
        "total_employees": len(records),
        "total_payout": round(total_payout, 2),
        "total_hours": round(total_hours, 2),
        "total_overtime_hours": round(total_overtime_hours, 2)
    }

# =====================================================================
# 5. SELF-TEST (Runs only when executing this file directly)
# =====================================================================
if __name__ == "__main__":
    kpis = get_ceo_kpis("2026-10")
    print("\n" + "=" * 50)
    print(f"📊 EXECUTIVE KPI REPORT FOR VARUN SHARMA ({kpis['month']})")
    print("=" * 50)
    print(f"Total Employees:      {kpis['total_employees']}")
    print(f"Total Hours Logged:   {kpis['total_hours']} hrs")
    print(f"Total Overtime Hours: {kpis['total_overtime_hours']} hrs")
    print(f"Total Net Payout:     ${kpis['total_payout']:,.2f}")
    print("=" * 50)