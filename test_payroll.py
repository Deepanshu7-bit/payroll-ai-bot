# 1. Employee Information (Variables)
employee_name = "Alex Carter"
hourly_rate = 1000
standard_hours = 160
actual_hours_worked = 175

# 2. Logic: Did this person work overtime?
if actual_hours_worked > standard_hours:
    overtime_hours = actual_hours_worked-standard_hours
    regular_hours = standard_hours
else:
    overtime_hours = 0
    regular_hours = actual_hours_worked

# 3. Overtime pay is 1.5x regular pay
regular_pay = regular_hours * hourly_rate
overtime_pay = overtime_hours * (hourly_rate * 1.5)
gross_salary = regular_pay + overtime_pay

# 4. Standard Deductions (e.g., 10% tax)
tax_deduction = gross_salary * 0.10
net_salary = gross_salary - tax_deduction

# 5. Print the Executive Report to the Terminal
print("==============================")
print(f"PAYROLL REPORT FOR: {employee_name}")
print("==============================")
print(f"Regular Hours: {regular_hours} hrs  --> ${regular_pay}")
print(f"Overtime Hours: {overtime_hours} hrs  --> ${overtime_pay}")
print(f"Gross Salary:  ${gross_salary}")
print(f"Tax Deduction (10%): -${tax_deduction}")
print("------------------------------")
print(f"NET SALARY TO PAY: ${net_salary}")
print("==============================")