class ApiError extends Error{
    constructor(
        statusCode,
        message = "Something went wromg",
        error = [],
        stack ="",
    ){
        super(message);
        this.statusCode = statusCode
        this.message = message
        this.success = false 
        this.errors = this.errors
        if(stack){
            this.stack = stack
        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {ApiError}
// this file standardize backends error