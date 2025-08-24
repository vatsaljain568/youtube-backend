import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'

// MONGODB mai no-sql database hote hai
// Because iss function ko apan baar baar use karne wale hai
const generateAccessAndRefreshTokens = async (userId) => {
    try {

        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // Database mai Refresh token ko store karna padega
        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });
        return {
            accessToken,
            refreshToken
        }

    } catch (error) {
        throw new ApiError(500, "Failed to generate tokens");
    }
}

// High-level function to register a user
const registerUser = asyncHandler(async (req, res) => {

    /*
    //              ROADMAP
    // get user details from frontend
    // validation -> not empty
    // check if user already exists: username, email {FLAGS}
    // check for images and avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refreshToken filed from response
    // check for user creation {FLAGS}
    // return res
    */


    // get user details from frontend
    // Basically we are destructuring and req.body sae form related or text related content aata hai not url encoded
    const { username, email, fullName, password } = req.body
    // console.log("email: ", email);

    // validation -> not empty
    // sare beginner ek ek karke hi check karte hai but this is industry ready approach

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError("All fields are required", 400)
    }


    // check if user already exists: username, email {FLAGS}
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError("User with email or username already exists", 409)
    }

    // check for images and avatar
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const localCoverImgPath = req.files?.coverImage?.[0]?.path;


    if (!avatarLocalPath) {
        throw new ApiError("Avatar file is required", 408)
    }

    // upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    console.log("avatar: ", avatar);


    // Agar yaha cloudinary mai kuch nahi jayega then vo ek empty string return karega
    const coverImage = await uploadOnCloudinary(localCoverImgPath)

    if (!avatar) {
        throw new ApiError("Issue on uploading to cloudinary ", 400)
    }

    // create user object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password,
        email,
        username: username.toLowerCase()
    })

    // Thoda sa weird syntax
    // basically .select sae vo fields ko hata rahe hai jo hume nahi chahiye
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError("Something went wrong while registering ths user", 500)
    }

    return res.status(201).json(
        new ApiResponse(200, "User Registered successfully", createdUser)
    )
});

const loginUser = asyncHandler(async (req, res) => {
    // req body sae data lae aoo
    // username or email
    // find user in db
    // if user not found then throw error
    // if found then check password
    // if password is correct then generate access token and refresh token
    // send cookies 

    const { username, email, password } = req.body;

    // validation
    if (!(username || email)) {
        throw new ApiError(400, "Username or email is required")
    }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const isPasswordMatched = await user.isPasswordCorrect(password);

    if (!isPasswordMatched) {
        throw new ApiError(401, "Invalid credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    // Now apne paas jo abhi user hai vo purana wala hai uske paas refresh token nahi hai so i have now 2 options ->
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // Now we will send the cookies
    const options = {
        httpOnly: true, // now frontend sae koi bhi javascript cookie ko edit nahi kar sakta
        secure: true // only send cookie over https
    }

    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, loggedInUser, "User logged in successfully"));
})

const logoutUser = asyncHandler(async (req, res) => {
    // 2 hi kaam karne hai that is remove the cookies and remove the refresh token from the database

    // Yea apan tabh hi karenge jab apan user true logged in ho uske liye we will check using middleware
    await User.findByIdAndUpdate(
        req.user._id,
        // now update karna kya hai
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true // return the updated user
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, "User logged out successfully")
        );

})

// This function is used to refresh the access token using the refresh token
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            // logout user because refresh token is expired

        }

        const options = {
            httpOnly: true,
            secure: true
        }

        // This is more secure to get the new refresh token.
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassoword } = req.body;

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }
    user.password = newPassoword;
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            req.user,
            "User fetched successfully"
        ))
})

// Text mai update wala alag sae likhna chayae file wale sae network par jyada pressure nahi ata
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Account details updated successfully")
        )
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    // Here files nahi file ayega because apan sirf ek hi chiz that is avatar ka path hi lae rahe hai
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading avatar on cloudinary")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    )
})

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover image updated successfully")
    )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
};