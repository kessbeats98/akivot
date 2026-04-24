// Shared phone helpers used by input validation, billing gating, and contact actions.

// Validates raw phone input; returns cleaned string or null if invalid.
// Rule: printable chars limited to digits, +, spaces, dashes, parens; >= 7 digits total; <= 32 chars.
export function validatePhone(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.length > 32) return null;
  if (!/^[\d+()\s-]+$/.test(trimmed)) return null;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 7) return null;
  return trimmed;
}

// Returns true iff a stored phone value passes the same usability bar used for validation.
// Use this for billing/contact gating — stronger than a non-empty trim check.
export function isUsablePhone(raw: string | null | undefined): boolean {
  if (!raw) return false;
  return validatePhone(raw) !== null;
}

// Normalizes a phone string for wa.me links (digits only, IL country-code prefix).
// Returns null if no digits are found.
export function normalizePhoneForWa(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("972")) return digits;
  if (digits.startsWith("0")) return `972${digits.slice(1)}`;
  return digits;
}
