// Environment
export const IS_PRODUCTION = process.env.NODE_ENV === "production";

// Input validation
export const USERNAME_MIN_LENGTH = 3;
export const PASSWORD_MIN_LENGTH = 8;
export const REGEX_USERNAME = /^[a-zA-Z0-9_]+$/;
export const REGEX_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/; // For submission, password complexity has been left light, use 12345678 if required.

// Cookies
export const COOKIE_BASE_OPTIONS = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: IS_PRODUCTION ? "none" : "lax",
  path: "/",
};
export const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000; // 15 minutes
export const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
