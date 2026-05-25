export const Session = {
  cookieName: "kimi_sid",
  maxAgeMs: 365 * 24 * 60 * 60 * 1000,
} as const;

export const ErrorMessages = {
  unauthenticated: "Please sign in to continue.",
  insufficientRole: "You don't have permission to access this area.",
} as const;

export const FriendlyErrors = {
  unknown: "Something went wrong. Please try again.",
  network: "Connection issue. Please check your internet and try again.",
  timeout: "Request timed out. Please try again.",
  validation: "Please check your input and try again.",
  notFound: "The requested resource was not found.",
  serverError: "Server error. Please try again later.",
  unauthorized: "Please sign in to continue.",
  forbidden: "You don't have permission to access this.",
  fileTooLarge: "File is too large. Maximum size is 50MB.",
  tooManyFiles: "Maximum 5 files allowed. Please remove some files first.",
  invalidFileType: "Invalid file type. Please upload images, videos, PDFs, DOC, or ZIP files.",
  invalidEmail: "Please enter a valid email address.",
  emailInUse: "An account with this email already exists.",
  invalidCredentials: "Invalid email or password. Please try again.",
  passwordTooShort: "Password must be at least 6 characters.",
  otpInvalid: "Invalid or expired code. Please request a new one.",
  requiredField: "Please fill in all required fields.",
  invalidPhone: "Please enter a valid phone number.",
  maxFiles: "Maximum 5 files allowed.",
} as const;

export const Paths = {
  login: "/login",
  oauthCallback: "/api/oauth/callback",
} as const;
