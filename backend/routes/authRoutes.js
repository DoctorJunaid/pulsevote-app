// ==================== AUTHENTICATION & ACCOUNT ROUTES (authRoutes.js) ====================
// Defines REST endpoints for public user registration, OTP verification, password resets,
// and protected profile management, password updates, and account deletions.

import express from "express";
import { 
    login, 
    register, 
    updateProfile, 
    resendOtp, 
    verifyOtp, 
    changePassword,
    getMe,
    deleteAccount 
} from "../controllers/authController.js";
import { 
    forgotPassword, 
    verifyResetOtp, 
    resetPassword 
} from "../controllers/passwordController.js";
import { upload } from "../config/cloudinary.js";
import { protect } from "../middleware/auth.js";

const authRoutes = express.Router();

// ==================== PUBLIC ROUTES (No JWT required) ====================

/**
 * @route   POST /api/v1/auth/register
 * @desc    Registers a new account and sends an email verification OTP code
 */
authRoutes.post("/register", upload, register);

/**
 * @route   POST /api/v1/auth/verify-otp
 * @desc    Verifies account OTP code and issues JWT authentication token
 */
authRoutes.post("/verify-otp", verifyOtp);

/**
 * @route   POST /api/v1/auth/resend-otp
 * @desc    Resends account verification OTP code to user email
 */
authRoutes.post("/resend-otp", resendOtp); 

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticates credentials and issues JWT token
 */
authRoutes.post("/login", login);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Sends password recovery OTP email
 */
authRoutes.post("/forgot-password", forgotPassword);

/**
 * @route   POST /api/v1/auth/verify-reset-otp
 * @desc    Validates password recovery OTP code
 */
authRoutes.post("/verify-reset-otp", verifyResetOtp);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Sets new password using validated recovery OTP code
 */
authRoutes.post("/reset-password", resetPassword);

// ==================== PROTECTED ROUTES (JWT required) ====================

/**
 * @route   GET /api/v1/auth/me
 * @desc    Retrieves profile and dashboard stats for currently logged-in user
 */
authRoutes.get("/me", protect, getMe);  

/**
 * @route   PATCH /api/v1/auth/profile
 * @desc    Updates profile details (name, username, bio, avatar)
 */
authRoutes.patch("/profile", protect, upload, updateProfile);

/**
 * @route   PATCH /api/v1/auth/password
 * @desc    Changes account password for authenticated user
 */
authRoutes.patch("/password", protect, changePassword);

/**
 * @route   DELETE /api/v1/auth/account
 * @desc    Deletes user account and performs cascading cleanup of all associated data
 */
authRoutes.delete("/account", protect, deleteAccount);

export default authRoutes;