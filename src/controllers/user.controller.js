import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'

// MONGODB mai no-sql database hote hai

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
        throw new ApiError("All fields are required",400)
    }


    // check if user already exists: username, email {FLAGS}
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError("User with email or username already exists",409)
    }

    // check for images and avatar
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const localCoverImgPath = req.files?.coverImage?.[0]?.path;


    if (!avatarLocalPath) {
        throw new ApiError("Avatar file is required",408)
    }

    // upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    console.log("avatar: ", avatar);

    
    // Agar yaha cloudinary mai kuch nahi jayega then vo ek empty string return karega
    const coverImage = await uploadOnCloudinary(localCoverImgPath)

    if (!avatar) {
        throw new ApiError("Issue on uploading to cloudinary ",400)
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
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError("Something went wrong while registering ths user",500)
    }

    return res.status(201).json(
        new ApiResponse(200,"User Registered successfully",createdUser)
    )
});

export { registerUser };