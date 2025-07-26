import { asyncHandler } from "../utils/async-handler.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import {
  sendEmail,
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
} from "../utils/mail.js";

import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { ApiError } from "../utils/api-error.js";

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, role, fullname } = req.body;

  const ExistingUser = await User.findOne({ email });
  // console.log(ExistingUser)

  if (ExistingUser) {
    return res
      .status(409)
      .json(new ApiResponse(409, null, "User already exists"));
  }

  const user = await User.create({
    email,
    username,
    fullname,
    password,
    role,
  });

  const emailVerificationToken = crypto.randomBytes(32).toString("hex");
  // console.log("before verify",emailVerificationToken)
  user.emailVerificationToken = emailVerificationToken;
  await user.save();
  const emailUrl = `${process.env.BASE_URL}/api/v1/auth/verify-email/${emailVerificationToken}`
  await sendEmail({
    email: user.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user?.username,
      `${emailUrl}`
    ),
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: createdUser },
        "Account created Succesfully, you can login now"
      )
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  // console.log(password)
  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "User not found,please register"));
  }
  const isMatched = await bcrypt.compare(password, user.password);
  if (!isMatched) {
    return res
      .status(401)
      .json(
        new ApiResponse(
          401,
          null,
          "Invalid credientials please enter correct credientials"
        )
      );
  }
  const accessToken = jwt.sign(
    {
      id: user._id,
      username: user.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
  const refreshToken = jwt.sign(
    {
      id: user._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
  user.refreshToken = refreshToken;
  const loggedInUser = await User.findById(user._id).select(
    "-password -emailVerificationToken -emailVerificationExpiry"
  );
 
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
  };
  const cookie2Options = {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000 * 10,
  };
   //cookie name cannot have spaces

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookie2Options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "Logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  
  return res
    .status(200)
    .clearCookie("accessToken", {})
    .clearCookie("refreshToken", {})
    .clearCookie("loginToken",{})
    .json(new ApiResponse(200, null, "User logged out Succesfully"));
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { emailVerificationToken } = req.params;
  emailVerificationToken.trim()
  if (!emailVerificationToken) {
    return res.status(401).json(new ApiResponse(401, null, "no token found"));
  }
  // console.log("in verify",emailVerificationToken)
  const user = await User.findOne({
    emailVerificationToken
  });
  console.log(user)
  if (!user) {
    return res.status(400).json(new ApiResponse(401, null, "no user found"));
  }
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Email verified Succesfully"));
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  
});
const resetForgottenPassword = asyncHandler(async (req, res) => {
 
});

const refreshAccessToken = asyncHandler(async (req, res) => {
 
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404).json(new ApiResponse(404, null, "Email not registered"));
  }
  const unhashedToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(unhashedToken)
    .digest("hex");
  
  user.forgotPassword = hashedToken;
  user.forgotPasswordExpiry = Date.now() + 10 * 60 * 1000;
  
  user.save({ validateBeforeSave: false });
  const resetUrl = `${process.env.BASE_URL}/api/v1/auth/reset-password/${unhashedToken}`;
  await sendEmail({
    email: user.email,
    subject: "Please click button to reset password",
    mailgenContent: forgotPasswordMailgenContent(user?.username, `${resetUrl}`),
  });
  res.status(200).json(
    new ApiResponse(200,null,"Check your inbox for reset url")
  )
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { resetToken: token } = req.params;
  const { password, confirmPassword } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  // console.log(hashedToken)

  const user = await User.findOne({
    forgotPassword: hashedToken,
    forgotPasswordExpiry: { $gt: Date.now() }
  });

  if (!user) {
    throw new ApiError(401, "Invalid token");
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, "Password and confirm password do not match");
  }

  user.password = password;
  user.forgotPassword = undefined;
  user.forgotPasswordExpiry = undefined;

  await user.save({ validateBeforeSave: false });

  res.status(200).json(
    new ApiResponse(200, "", "Password reset successfully. You can log in now.")
  );
});


const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  console.log(user);

  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "No user found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User info fetched Succesfully"));
});

export {
  changeCurrentPassword,
  forgotPasswordRequest,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  resetForgottenPassword,
  verifyEmail,
};
