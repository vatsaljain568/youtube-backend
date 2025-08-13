class ApiError extends Error {

  constructor(message="Something went wrong", statusCode,errors = []) 
  {
    super(message);
    this.statusCode = statusCode;
    this.data = NULL;
    this.message = message;
    this.success = false;
    this.errors = errors;
  }

}
export {ApiError};