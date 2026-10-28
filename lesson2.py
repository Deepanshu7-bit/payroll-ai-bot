# -------------------------------------------------------------
# STEP 1: Define the Reusable Salary Calculator Function
# -------------------------------------------------------------
def calculate_employee_salary(name, hours_worked, hourly_rate, standard_hours=160):
    """
    This function takes an employee's hours and rate,
    and returns a clean dictionary containing the full pay breakdown.
    """
    # Overtime check
    if hours_worked > standard_hours:
        overtime_hours = hours_worked - standard_hours
        regular_hours = standard_hours
    else:
        overtime_hours = 0
        regular_hours = hours_worked

    # Math calculations
    regular_pay = regular_hours * hourly_rate
    overtime_pay = overtime_hours * (hourly_rate * 1.5)
    gross_salary = regular_pay + overtime_pay

    # Deductions: 10% tax
    tax_deduction = gross_salary * 0.10
    net_salary = gross_salary - tax_deduction

    # Instead of just printing, we RETURN a dictionary (object)
    # so other parts of our app (like our API or AI) can use the data!
    return {
        "name": name,
        "hours_worked": hours_worked,
        "regular_pay": regular_pay,
        "overtime_hours": overtime_hours,
        "overtime_pay": overtime_pay,
        "gross_salary": gross_salary,
        "tax_deduction": tax_deduction,
        "net_salary": net_salary
    }


# -------------------------------------------------------------
# STEP 2: A List of Employees (Just like data from nugenova.com)
# -------------------------------------------------------------
timesheet_data = [
    {"name": "Alex Carter", "hours": 175, "rate": 30.0},
    {"name": "Priya Sharma", "hours": 160, "rate": 45.0},
    {"name": "David Kim",    "hours": 150, "rate": 28.0},
    {"name": "Sara Connor",  "hours": 190, "rate": 35.0}
]


# -------------------------------------------------------------
# STEP 3: Loop Through Each Employee and Calculate Their Pay
# -------------------------------------------------------------
company_total_payout = 0

print("=" * 65)
print(f"{'EMPLOYEE':<15} | {'HOURS':<6} | {'GROSS':<10} | {'DEDUCTION':<10} | {'NET SALARY':<10}")
print("=" * 65)

for emp in timesheet_data:
    # Call the function for this specific employee
    result = calculate_employee_salary(
        name=emp["name"], 
        hours_worked=emp["hours"], 
        hourly_rate=emp["rate"]
    )
    
    # Add to company total payout
    company_total_payout = company_total_payout + result["net_salary"]

    # Print a clean row in the table
    print(f"{result['name']:<15} | {result['hours_worked']:<6} | ${result['gross_salary']:<9.2f} | -${result['tax_deduction']:<9.2f} | ${result['net_salary']:<9.2f}")

print("=" * 65)
print(f"TOTAL COMPANY PAYROLL TO DISBURSE: ${company_total_payout:,.2f}")
print("=" * 65)