import {asyncHandler} from "../utils/async-handler.js"

export const registerUser = asyncHandler(async (req,res) => {
    const {username,name,email,password} = req.body
})