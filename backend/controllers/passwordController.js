// ==================== PASSWORD RECOVERY CONTROLLER (passwordController.js) ====================
// Handles forgotten password flows: requesting OTP resets via email,
// verifying reset OTP codes, and setting new user credentials.

import User from "../models/User.js";
import { sendPasswordResetOtpEmail } from "../config/mailer.js";
import { generateOpt, optValid, otpExpiry } from "../utils/opt.js";

/**
 * 1. REQUEST PASSWORD RESET (FORGOT PASSWORD)
 * Logic:
 * - Finds registered account matching requested email.
 * - Generates 6-digit verification OTP and sets expiry window.
 * - Sends recovery OTP email to user inbox.
 */
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const otp = generateOpt();
        user.otp = otp;
        user.otpExpiry = otpExpiry();
        await user.save();

        await sendPasswordResetOtpEmail(email, otp);
        res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * 2. VERIFY PASSWORD RESET OTP
 * Logic:
 * - Validates whether the submitted OTP code is correct and unexpired before proceeding to password entry UI step.
 */
export const verifyResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });
        if (!optValid(user, otp)) return res.status(400).json({ message: "Invalid OTP or expired" });

        res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * 3. RESET PASSWORD
 * Logic:
 * - Re-validates length requirement (minimum 8 characters) and OTP validity.
 * - Updates user password (triggering password hash pre-save hook in model).
 * - Clears OTP fields and sets account as verified.
 */
export const resetPassword = async (req, res) => {
    const { email, password, otp } = req.body;
    if (!password || password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters long" });
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });
        if (!optValid(user, otp)) return res.status(400).json({ message: "Invalid OTP or expired" });

        user.password = password;
        user.otp = undefined;
        user.otpExpiry = undefined;
        user.isVerified = true;
        await user.save();

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
