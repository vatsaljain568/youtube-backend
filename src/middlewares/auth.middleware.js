import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

// Basically apan nae token liye thorugh either cookies or header then humne token ko decode kiya through jwt.verify then uss decoded token mai jo apan nae id save ki thi in payload uss id sae apan user find karengae in our User database agar mila toh next() kar denge aur req.user mai user ki details save kar denge taki aagey ke controllers mai use kar saken warna agar user nahi mila toh error throw kar denge





// User Logged in hai ya nahi hai ye check karne wala middleware
export const verifyJWT = asyncHandler(async (req, res, next) => {

    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            throw new ApiError(401, "Unauthorized access, no token provided");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        // decoded Token kae paas sari vo value hai jo apan nae jwt.sign mai dali thi
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid Acces Token")
        }

        req.user = user; // Now we can access the user in the next middleware or controller
        next();
    } catch (error) {
        throw new ApiError(401, "Unauthorized access, invalid token");
    }
})