import User from "../models/User.js";
import { sendOtpEmail } from "../config/mailer.js";
import { generateOpt, optValid, otpExpiry } from "../utils/opt.js";


// if user forget the password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });
        const otp = generateOpt();
        user.otp = otp;
        user.otpExpiry = otpExpiry();
        await user.save();
        await sendOtpEmail(email, 'Verify your account', `Your OTP is ${otp} and it will expire in 10 minutes`);
        res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// to check otp is valid
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


// to reset the password
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

