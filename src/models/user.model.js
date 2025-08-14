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