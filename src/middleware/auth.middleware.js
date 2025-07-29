import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import {ApiError} from "../utils/api-error.js"
import {User} from "../models/user.models.js"
import jwt from "jsonwebtoken"
import { projectMember } from "../models/projectmember.models.js";
import mongoose from "mongoose";

export const isLoggedIn = asyncHandler(async(req,res,next) => {
    const token = req.cookies.accessToken
    console.log(token)
    if (!token){
        return res.status(404).json(
            new ApiResponse(404,null,"No token found")
        )
    }
    const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    // console.log(decodedToken)
    const user = await User.findById(decodedToken.id).select("-password -refreshToken")

    // console.log(user)

    req.user = user
    next()
})

export const validateProjectPermission = (roles=[]) => asyncHandler(async(req,res,next) => {
    const {projectId} = req.params


    if(!projectId){
        throw new ApiError(401,"no id provided")
    }

    const Project = await projectMember.findOne({
        project :projectId,
        user :req.user._id
    })
    
    if(!Project){
        throw new ApiError(401,"No Project found")
    }

    const givenRole = Project?.role

    req.user.role = givenRole
    
    if(!roles.includes(givenRole)){
        throw new ApiError(403,"You do not have permission to access this action")
    }
    next()

})