import { getCurrentUser } from "./session";

export type Role = "owner" | "administrator" | "sales_rep" | "viewer";

const RANK: Record<Role, number> = { viewer: 0, sales_rep: 1, administrator: 2, owner: 3 };

export function hasRole(userRole: string, allowed: Role[]): boolean {
  return allowed.includes(userRole as Role);
}

export function atLeast(userRole: string, min: Role): boolean {
  return (RANK[userRole as Role] ?? -1) >= RANK[min];
}

export async function requireRole(allowed: Role[]) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  if (!hasRole(user.role, allowed)) throw new Error("Forbidden: insufficient role");
  return user;
}

export async function requireMinRole(min: Role) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  if (!atLeast(user.role, min)) throw new Error("Forbidden: insufficient role");
  return user;
}
