import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
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
   console.log("email: ", email);

   // validation -> not empty
   // sare beginner ek ek karke hi check karte hai but this is industry ready approach
   
   if ([username, email, fullName, password].some((field) => field?.trim() === "")) {
       throw new ApiError(400, "All fields are required !!")
    }
    
    // check if user already exists: username, email {FLAGS}
    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })
    
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists !!")
    }
    
    // check for images and avatar
    const localAvatarPath = req.files?.avatar[0]?.path
    const localCoverImgPath = req.files?.coverImage[0]?.path
    
    if (!localAvatarPath) {
        throw new ApiError(400, "Avatar is required")
    }

    // upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(localAvatarPath)
    const coverImage = await uploadOnCloudinary(localCoverImgPath)
    
    if (!avatar) {
        throw new ApiError(400, "Avata file is required")
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

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering ths user")
    }

    return res.status(201).json(
        new ApiResponse(201,createdUser,"User Registered successfully")
    )
});

export { registerUser };