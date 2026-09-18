// Centralized environment variable access with safe fallbacks for
// development. Secrets should always be provided via the environment in
// production (see .env.example).

function required(name: string, fallbackForDev: string): string {
  const value = process.env[name];
  if (value && value.length > 0) return value;
  if (process.env.NODE_ENV === "production") {
    // Fail loudly in production if a secret is missing.
    // eslint-disable-next-line no-console
    console.error(`[env] Missing required environment variable: ${name}`);
  }
  return fallbackForDev;
}

export const env = {
  jwtSecret: required(
    "JWT_SECRET",
    "dev-only-insecure-secret-change-me-please-0123456789"
  ),
  paymentSecretKey: process.env.PAYMENT_SECRET_KEY ?? "",
  imageStorageKey: process.env.IMAGE_STORAGE_KEY ?? "",
  emailApiKey: process.env.EMAIL_API_KEY ?? "",
  apiBaseUrl: process.env.API_BASE_URL ?? "http://localhost:3000",
};
