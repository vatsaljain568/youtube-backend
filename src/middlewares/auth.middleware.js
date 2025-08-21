import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";


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