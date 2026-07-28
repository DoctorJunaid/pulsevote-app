// ==================== AUTHENTICATION & USER MANAGEMENT CONTROLLER ====================
// This controller manages user account creation, verification via OTP, authentication (JWT),
// profile updates, password changes, account deletion, and fetching user dashboard stats.

import User from "../models/User.js";
import Poll from "../models/Poll.js";
import Comment from "../models/Comment.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import { generateOpt, optValid, otpExpiry } from "../utils/opt.js";
import { sendOtpEmail } from "../config/mailer.js";
import jwt from "jsonwebtoken";

/**
 * HELPER: Generates a JSON Web Token (JWT) signed with the user's ID.
 * Why: JWT allows stateless authentication; the frontend sends this token in headers
 * to access protected endpoints without forcing the server to store session state in memory.
 */
const makeToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

/**
 * HELPER: Sanitizes user objects before sending them in API responses.
 * Why: Excludes sensitive database fields like hashedPassword, OTP codes, and reset tokens
 * to protect user data and ensure strict privacy standards.
 */
const cleanUser = (user) => {
    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
    };
};

/**
 * 1. REGISTER USER
 * Logic:
 * - Validates that all required registration fields (name, email, username, password) are provided.
 * - Checks if the email or username is already registered to avoid duplicates.
 * - Handles optional avatar upload via Cloudinary if an image file was attached.
 * - Generates a 6-digit One-Time Password (OTP) and sets a 10-minute expiry window.
 * - Saves the unverified user to the database and dispatches a verification email.
 */
export const register = async (req, res) => {
    const { name, email, username, password } = req.body;

    try {
        if (!name || !email || !username || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const exist = await User.findOne({ $or: [{ email }, { username }] });
        if (exist) {
            return res.status(400).json({ message: "User already exists" });
        }

        let avatar = "";
        if (req.file) {
            try {
                avatar = await uploadToCloudinary(req.file.buffer);
            } catch (err) {
                console.warn("Avatar upload skipped:", err.message);
            }
        }

        const otp = generateOpt();
        const user = await User.create({
            name,
            email,
            username,
            password,
            avatar,
            otp,
            otpExpiry: otpExpiry()
        });

        await sendOtpEmail(email, 'Verify your account', `Your OTP is ${otp} and it will expire in 10 minutes`);
        res.status(201).json({
            needsVerification: true,
            email,
            message: "OTP sent successfully"
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * 2. VERIFY ACCOUNT OTP
 * Logic:
 * - Looks up the user by email address.
 * - Validates the submitted OTP against the stored code and expiration timestamp.
 * - On success, sets `isVerified` to true, clears temporary OTP fields, saves the user,
 *   and returns an authentication JWT token along with the sanitized profile.
 */
export const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (!user.isVerified && !optValid(user, otp)) {
            return res.status(400).json({ message: "Invalid OTP or expired" });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.json({
            token: makeToken(user._id),
            user: cleanUser(user)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * 3. RESEND VERIFICATION OTP
 * Logic:
 * - Checks if an unverified user exists for the given email address.
 * - Generates a new 6-digit OTP code and updates the expiration timestamp.
 * - Dispatches the fresh OTP email to complete account activation.
 */
export const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.isVerified) {
            return res.status(400).json({ message: "User is already verified" });
        }

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

/**
 * 4. USER LOGIN
 * Logic:
 * - Finds the user by email address and verifies their password using bcrypt comparison.
 * - Checks whether the account has verified their email address; if not, blocks login.
 * - Issues a fresh JWT authentication token and returns sanitized user data.
 */
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        if (!user.isVerified) {
            return res.status(403).json({
                message: "Please verify your email first",
                needsVerification: true,
                email
            });
        }

        res.json({
            token: makeToken(user._id),
            user: cleanUser(user)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * 5. UPDATE USER PROFILE
 * Logic:
 * - Allows authenticated users to update their name, username, bio, or avatar.
 * - Verifies username uniqueness if the username is being modified.
 * - Uploads the new profile picture to Cloudinary if a new image file is attached.
 */
export const updateProfile = async (req, res) => {
    try {
        const { name, username, bio } = req.body;
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (username && username !== user.username) {
            const taken = await User.findOne({ username });
            if (taken) return res.status(400).json({ message: "Username already taken" });
            user.username = username;
        }
        if (name) user.name = name;
        if (bio !== undefined) user.bio = bio;
        if (req.file) {
            try {
                user.avatar = await uploadToCloudinary(req.file.buffer);
            } catch (e) {
                console.warn("Avatar upload skipped:", e.message);
            }
        }
        await user.save();
        res.json({ user: cleanUser(user) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * 6. CHANGE PASSWORD
 * Logic:
 * - Enforces security policies (minimum length of 8 characters, must differ from existing password).
 * - Confirms the user's identity by validating their current password before modifying.
 * - Encrypts and saves the new password via the pre-save hook in the User model.
 */
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({ message: "New password must be at least 8 characters long" });
        }
        if (newPassword === currentPassword) {
            return res.status(400).json({ message: "New password cannot be same as current password" });
        }
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        if (!(await user.matchPassword(currentPassword))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        user.password = newPassword;
        await user.save();
        res.json({ message: "Password changed successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * 7. DELETE ACCOUNT (CASCADING DELETION)
 * Logic:
 * - Why cascading delete: Deleting a user without cleaning associated documents leads to orphaned database data.
 * - Finds all poll IDs created by the user.
 * - Deletes all comments authored by the user OR written on any polls owned by the user.
 * - Removes all polls created by the user.
 * - Pulls/removes any votes cast by this user from remaining polls in the system.
 * - Removes the user record from the database.
 */
export const deleteAccount = async (req, res) => {
    try {
        const id = req.userId;
        const mypolls = await Poll.find({ creator: id }).select("_id");
        const pollIds = mypolls.map(p => p._id);

        await Comment.deleteMany({ $or: [{ user: id }, { poll: { $in: pollIds } }] });
        await Poll.deleteMany({ creator: id });
        await Poll.updateMany(
            {},
            {
                $pull: {
                    votes: {
                        user: id
                    }
                }
            }
        );
        await User.findByIdAndDelete(id);
        res.json({ message: "Account deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * 8. GET CURRENT LOGGED-IN USER PROFILE (GET ME)
 * Logic:
 * - Fetches profile information for the currently authenticated user.
 * - Performs parallel MongoDB aggregation queries (`Promise.all`) to count:
 *   1. Number of polls created by the user.
 *   2. Number of polls voted on by the user.
 * - Returns sanitized profile along with dynamic stats for dashboard display.
 */
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const [created, voted] = await Promise.all([
            Poll.countDocuments({ creator: req.userId }),
            Poll.countDocuments({ "votes.user": req.userId })
        ]);
        res.json({
            user: cleanUser(user),
            created,
            voted,
            bookmark: user.bookmarks?.length || 0
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
