import express from "express"
import { changeCurrentPassword, forgotPasswordRequest, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, resendEmailVerification, verifyEmail, } from "../controllers/user.controllers.js"
import { validate } from "../middleware/validator.middleware.js"
import { userRegistrationValidator,userLoginValidator } from "../validators/index.js"
import { isLoggedIn } from "../middleware/auth.middleware.js"


const router = express.Router()

router.post('/register',userRegistrationValidator(),validate,registerUser)
router.post('/login',userLoginValidator(),loginUser)
router.get('/logout',isLoggedIn,logoutUser)
router.get('/profile',isLoggedIn,getCurrentUser)
router.get('/verify-email/:emailVerificationToken',verifyEmail);
router.post('/forgot-password',forgotPasswordRequest)
router.post('/reset-password/:resetToken',changeCurrentPassword)
router.get('/refresh-accesstoken',refreshAccessToken)
router.get('/resend-verification',isLoggedIn,resendEmailVerification)



export default router