
//  This is called Higher Order Function
// This is a Wrapper function that takes another function as an argument and returns a new function that handles errors.


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