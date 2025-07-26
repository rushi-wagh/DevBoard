import express from "express"
import { getCurrentUser, loginUser, logoutUser, registerUser, verifyEmail } from "../controllers/auth.controllers.js"
import { validate } from "../middleware/validator.middleware.js"
import { userRegistrationValidator } from "../validators/index.js"
import { isLoggedIn } from "../middleware/auth.middleware.js"


const router = express.Router()

router.post('/register',userRegistrationValidator(),validate,registerUser)//factory pattern
router.post('/login',loginUser)
router.get('/logout',isLoggedIn,logoutUser)
router.get('/profile',isLoggedIn,getCurrentUser)
router.route("/verify-email/:emailVerificationToken").get(verifyEmail);

export default router