import {body} from "express-validator"

export const userRegistrationValidator = () => {
    return[
        body('email')
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Email is invalid"),
        body("username")
        .trim()
        .isLength({min:3}).withMessage("Username should be atleast 3 char")
        .isLength({max:6}).withMessage("max character cannot exceed 13 char"),
        body("password")
        .trim()
        .notEmpty().withMessage("Password cannot be empty")
    ]
}
export const userLoginValidator = () => {
    return [
        body("email")
        .isEmail.withMessage("Email is invalid"),
        body("password")
        .trim()
        .notEmpty().withMessage("Password is required to login")
    ]
}
