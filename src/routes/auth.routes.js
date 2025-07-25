import express from "express"
import { registerUser } from "../controllers/auth.controllers.js"
import { validate } from "../middleware/validator.middleware.js"
import { userRegistrationValidator } from "../validators/index.js"


const router = express.Router()

router.post('/register',userRegistrationValidator(),validate,registerUser)//factory pattern

export default router