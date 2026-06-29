export const APP_ROLES = [
  "ADMIN",
  "PAYROLL_MANAGER",
  "PAYROLL_STAFF",
  "EMPLOYEE",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export type AuthUser = {
  id: string;
  email: string;
  role: AppRole;
};
