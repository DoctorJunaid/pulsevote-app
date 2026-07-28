import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    avatar: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: "",
        maxlength: 160,
    },
    bookmarks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Poll"
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String,
    },
    otpExpiry: {
        type: Date,
    }
}, {
    timestamps: true
});
userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

//  compare password 
userSchema.methods.matchPassword = async function (plainPassword) {
    return await bcrypt.compare(plainPassword, this.password);
};
export default mongoose.model("User", userSchema);