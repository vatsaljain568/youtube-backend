import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            // Agar kisi bhi field mai searching karna ho to isko index bana sakte hain
            index: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },

        avatar: {
            type: String, // cloudinary url
            required: true
        },

        coverImage: {
            type: String,
            required: true
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters long"]
        },

        refreshToken: {
            type: String
        },

        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video"
            }
        ]
    },
    { timestamps: true }
);


// Hash the password before saving the user and async because cryptographic operations are asynchronous
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10); // 10 is the salt rounds
    next();
});

// Now we will create a method to compare the password
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
    // This will return a boolean value
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            // payload
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        // Access token
        process.env.ACCESS_TOKEN_SECRET,
        // expiry object kae andar jata hai
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}


userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema);


/*
JWT, Access Token, Refresh Token — Quick Notes ->

JWT (JSON Web Token)
Compact, signed token used for authentication/authorization.
Structure: header.payload.signature
Header: token type & algorithm.
Payload: public claims (user id, role, expiry).
Signature: proves data wasn’t tampered with (integrity).
Signed ≠ encrypted — payload is readable but protected against changes.
Created & verified using libraries like jsonwebtoken.



Access Token
A JWT specifically used to access protected resources.
Short-lived (e.g., 5–15 min) to limit damage if stolen.
Sent with each request (usually in Authorization: Bearer <token>).
Contains enough claims for the server to identify the user & permissions.



Refresh Token
Long-lived token (days/weeks) used to obtain new access tokens.
Sent only when the access token expires.
Should be stored securely (e.g., HttpOnly Secure cookie).
If stolen, attacker can keep getting new access tokens — must be well protected.


Why Access Token is Short-lived & Refresh Token is Long-lived
Access token: Higher exposure (sent on every request) → shorter life reduces risk.
Refresh token: Lower exposure (used rarely) → longer life improves user experience.


Auth Flow Example
User logs in → server issues:
Access token (short life).
Refresh token (long life).
Access token sent with every API request.
When access token expires → client sends refresh token to get a new one.
When refresh token expires → user must log in again.
*/