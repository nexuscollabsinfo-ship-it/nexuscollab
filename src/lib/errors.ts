/**
 * Converts any backend error into a user-friendly message.
 * Never shows raw JSON Zod errors to users.
 */
export function getFriendlyError(error: unknown): string {
  // Already a string
  if (typeof error === "string") return simplifyMessage(error);

  // Has a message property
  if (error && typeof error === "object" && "message" in error) {
    const msg = (error as any).message;
    if (typeof msg === "string") return simplifyMessage(msg);
  }

  // Array of errors (Zod sometimes returns this)
  if (Array.isArray(error)) {
    return "Please check your input and try again.";
  }

  return "Something went wrong. Please try again.";
}

/** Simplifies raw backend error messages into human-friendly text. */
function simplifyMessage(raw: string): string {
  const lower = raw.toLowerCase();

  // Zod / validation errors
  if (lower.includes("invalid_type") || lower.includes("expected")) {
    return "Please check your input and try again.";
  }
  if (lower.includes("too_small") || lower.includes("too_big")) {
    return "Some fields have invalid values. Please review and try again.";
  }

  // Auth errors
  if (lower.includes("invalid email or password")) {
    return "Invalid email or password. Please try again.";
  }
  if (lower.includes("already exists")) {
    return "An account with this email already exists.";
  }
  if (lower.includes("unauthorized") || lower.includes("unauthenticated")) {
    return "Please sign in to continue.";
  }
  if (lower.includes("forbidden") || lower.includes("permission")) {
    return "You don't have permission to access this.";
  }

  // Input errors
  if (lower.includes("required")) {
    return "Please fill in all required fields.";
  }
  if (lower.includes("invalid")) {
    return "Please check your input and try again.";
  }
  if (lower.includes("not found")) {
    return "The requested resource was not found.";
  }

  // Database errors
  if (lower.includes("duplicate")) {
    return "This entry already exists.";
  }

  // Server errors
  if (lower.includes("internal server error") || lower.includes("500")) {
    return "Server error. Please try again later.";
  }

  // Return cleaned-up version of original if unrecognized
  if (raw.length > 0 && raw.length < 200) return raw;
  return "Something went wrong. Please try again.";
}
