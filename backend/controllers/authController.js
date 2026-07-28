import User from "../models/User.js";
import Poll from "../models/Poll.js";
import Comment from "../models/Comment.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import { generateOpt, optValid, otpExpiry } from "../utils/opt.js";
import { sendOtpEmail } from "../config/mailer.js";
import jwt from "jsonwebtoken";

const makeToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

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
            // upload to cloudinary
            try {
                avatar = await uploadToCloudinary(req.file.buffer);
            } catch (err) {
                console.warn("Avatar upload skipped:", err.message);
            }
        }

        // generate otp
        const otp = generateOpt();
        const user = await User.create({ name, email, username, password, avatar, otp, otpExpiry: otpExpiry() });
        // send otp to user 
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

// To verify otp 
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
        // generate token 
        res.json({
            token: makeToken(user._id),
            user: cleanUser(user)      // excluding password field   
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// resending OTP
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

// Login a user
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        if (!user.isVerified) {
            return res.status(403).json({ message: "Please verify your email first", needsVerification: true, email });
        }

        res.json({
            token: makeToken(user._id),
            user: cleanUser(user)      // excluding password field   
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// to update profile
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
            try { user.avatar = await uploadToCloudinary(req.file.buffer); }
            catch (e) { console.warn("Avatar upload skipped:", e.message); }
        }
        await user.save();
        res.json({ user: cleanUser(user) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

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

// to delete Account 
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

// to get logged in user profile 
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const [created, voted] = await Promise.all([
            Poll.countDocuments({ creator: req.userId }),
            Poll.countDocuments({ "votes.user": req.userId })
        ]);
        res.json({ user: cleanUser(user), 
            created, 
            voted,
            bookmark: user.bookmarks?.length || 0
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
