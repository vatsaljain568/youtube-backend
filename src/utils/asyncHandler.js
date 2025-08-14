
//  This is called Higher Order Function
// This is a Wrapper function that takes another function as an argument and returns a new function that handles errors.

// Dekho apne ko baar baar database sae connect toh karna hi hai so baar baar try-catch and async await karne ki zarurat nahi hai Instead we can create a wrapper.


const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch((error) => {
                next(error);
            });
    }
}

// Try catch Approach
/* 
const asyncHandler = (fn) => async (req, res, next) => {
    
    try {
        await (fn(req, res, next))
    } catch (error) {
        res.status(error.code || 500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
}
*/

export { asyncHandler }