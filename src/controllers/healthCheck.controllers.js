import {ApiResponse} from "../utils/api-response.js"


export const healthCheck = async(req,res) => {
  res.status(200).json(
    new ApiResponse(200,{message:"Health Checked"})
  )
}