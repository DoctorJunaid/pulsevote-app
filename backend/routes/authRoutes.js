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

// public routes
authRoutes.post("/register", upload, register);
authRoutes.post("/verify-otp", verifyOtp);
authRoutes.post("/resend-otp", resendOtp); 
authRoutes.post("/login", login);
authRoutes.post("/forgot-password", forgotPassword);
authRoutes.post("/verify-reset-otp", verifyResetOtp);
authRoutes.post("/reset-password", resetPassword);

authRoutes.get("/me", protect, getMe);  

// private routes
authRoutes.patch("/profile", protect, upload, updateProfile);
authRoutes.patch("/password", protect, changePassword);
authRoutes.delete("/account", protect, deleteAccount);

export default authRoutes;