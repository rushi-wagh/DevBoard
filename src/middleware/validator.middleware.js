import { validationResult } from "express-validator"
import {ApiError} from '../utils/api-error.js'

export const validate = (req,res,next) => {
    const errors = validationResult(req)

    if(errors.isEmpty()) return next()
    const ExctractedArray = []
    errors.array().map((err) => { ExctractedArray.push({
        [err.path] : err.msg
    })}) 
    
    throw new ApiError(422,"Received data is not valid",ExctractedArray)
    
}