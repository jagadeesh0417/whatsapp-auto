export function normalizePhone(input: string): string {
  if (!input) return "";
  const digits = input.replace(/\D/g, "");
  // Default to India country code if 10 digits
  if (digits.length === 10) return "+91" + digits;
  if (digits.length === 12 && digits.startsWith("91")) return "+" + digits;
  if (digits.length > 10) return "+" + digits;
  return digits ? "+" + digits : "";
}

export function isValidPhone(input: string): boolean {
  const n = normalizePhone(input);
  return /^\+\d{10,15}$/.test(n);
}
