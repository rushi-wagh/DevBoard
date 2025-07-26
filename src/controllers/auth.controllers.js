import { asyncHandler } from "../utils/async-handler.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { sendEmail,emailVerificationMailgenContent } from "../utils/mail.js";

import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

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
  user.emailVerificationToken = emailVerificationToken;

  await user.save();
  await sendEmail({
    email: user.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user?.username,
      `${process.env.BASE_URL}/api/v1/auth/verify-email/${emailVerificationToken}`
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

  const token = jwt.sign({ id: user._id }, process.env.LOGIN_TOKEN_SECRET, {
    expiresIn: process.env.LOGIN_TOKEN_EXPIRY,
  });
  await user.save();
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
  res.cookie("loginToken", token, cookieOptions); //cookie name cannot have spaces

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
  res.cookie("loginToken", "", {});
  return res
    .status(200)
    .clearCookie("accessToken", {})
    .clearCookie("refreshToken", {})
    .json(new ApiResponse(200, null, "User logged out Succesfully"));
});

const verifyEmail = asyncHandler(async (req, res) => {
  const{emailVerificationToken} = req.params
  if(!emailVerificationToken) {
    return res.status(401).json(
      new ApiResponse(401,null,"no token found")
    )
  }
  const user = await User.findOne({
    emailVerificationToken
  })
  if(!user) {
    return res.status(400).json(
      new ApiResponse(401,null,"no user found")
    )
  }
  user.isEmailVerified = true
  user.emailVerificationToken = undefined
  await user.save()

  return res.status(200).json(
    new ApiResponse(200,null,"Email verified Succesfully")
  )

});

const resendEmailVerification = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});
const resetForgottenPassword = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  console.log(user)

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
