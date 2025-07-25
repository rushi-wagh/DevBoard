import {body} from "express-validator"

export const userRegistrationValidator = () => {
    return[
        body('email')
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Email is invalid")
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
