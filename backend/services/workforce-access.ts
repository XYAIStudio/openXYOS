import { dbGet } from "../db";
import type { AuthUser } from "../middleware";

export type WorkforceEmployee = {
  id: number;
  tenant_id: number;
  user_id?: number | null;
  source?: string | null;
  employee_type?: string | null;
  employment_category?: string | null;
};

export function isStudioEmployeeSource(source: unknown): boolean {
  const value = String(source || "").trim().toLowerCase();
  return value === "studio" || value === "xyai-studio" || value.startsWith("studio:");
}

export function isOrgEditableInteropEmployee(emp: WorkforceEmployee | null | undefined): boolean {
  if (!emp) return false;
  if (isStudioEmployeeSource(emp.source)) return true;
  return emp.employment_category === "reserve" && emp.employee_type === "ai" && !emp.user_id;
}

export function findEmployeeForOrgEdit(user: AuthUser, employeeId: string | number): WorkforceEmployee | undefined {
  const eid = String(employeeId);
  if (user.role === "super_admin") {
    return dbGet("SELECT * FROM employees WHERE id = ?", [eid]) as WorkforceEmployee | undefined;
  }

  const emp = dbGet("SELECT * FROM employees WHERE id = ? AND tenant_id = ?", [eid, user.tenant_id]) as WorkforceEmployee | undefined;
  if (!emp) return undefined;
  if (user.role === "admin") return emp;
  if (emp.user_id && Number(emp.user_id) === Number(user.id)) return emp;
  if (isOrgEditableInteropEmployee(emp)) return emp;
  return undefined;
}
