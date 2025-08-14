import {asyncHandler} from '../utils/asyncHandler.js';

// High-level function to register a user
const registerUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: 'User registered successfully'
    })
});

export { registerUser };