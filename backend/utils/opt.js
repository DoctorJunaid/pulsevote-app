// ==================== OTP UTILITY HELPERS (opt.js) ====================
// Provides helper functions for generating 6-digit One-Time Password (OTP) codes,
// calculating expiration timestamps, and validating OTP codes during user verification.

/**
 * 1. GENERATE 6-DIGIT OTP
 * Logic: Generates a random 6-digit numerical string between 100000 and 999999.
 */
export const generateOpt = () => {
    return String(Math.floor(100000 + Math.random() * 900000));
};

/**
 * 2. CALCULATE OTP EXPIRATION TIMESTAMP
 * Logic: Sets OTP validity window to 10 minutes from current time (Date.now() + 10 mins).
 */
export const otpExpiry = () => new Date(Date.now() + 10 * 60 * 1000);

/**
 * 3. VALIDATE OTP CODE
 * Logic: Verifies that the submitted OTP string matches stored `user.otp` AND current time has not passed `user.otpExpiry`.
 */
export const optValid = (user, otp) => {
    return user.otp === otp && user.otpExpiry > new Date();
};
