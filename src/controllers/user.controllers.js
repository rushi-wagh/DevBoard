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


  if (ExistingUser) {
    throw new ApiError(402,"User already exists");
  }

  const user = await User.create({
    email,
    username,
    fullname,
    password,
    role,
  });

  const emailVerificationToken = crypto.randomBytes(32).toString("hex");
  console.log("before verify", emailVerificationToken);
  const hashedToken = crypto
    .createHash("sha256")
    .update(emailVerificationToken)
    .digest("hex");
  let hashedemailVerificationToken = hashedToken;
  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = Date.now() + 10 * 60 * 1000;
  await user.save({ validateBeforeSave: false });
  const emailUrl = `${process.env.BASE_URL}/api/v1/auth/verify-email/${emailVerificationToken}`;
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

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(401,"Email not registerd")
  }
  const isMatched = await bcrypt.compare(password, user.password);
  if (!isMatched) {
    throw new ApiError(401,"Invalid email or password")
  }
  const accessToken = jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
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
  user.save();
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
    .clearCookie("loginToken", {})
    .json(new ApiResponse(200, null, "User logged out Succesfully"));
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { emailVerificationToken } = req.params;
  
  const token = emailVerificationToken.trim();


  console.log("token in verify controller", token);
  if (!emailVerificationToken) {
   throw new ApiError(401,"no token found")
  }
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  console.log("in verify", hashedToken);

  const user = await User.findOne({
    $and: [
      { emailVerificationToken: hashedToken },
      { emailVerificationExpiry: { $gt: Date.now() } },
    ],
  });
 
  if (!user) {
    throw new ApiError(401, "Invalid token")
  }
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Email verified Succesfully"));
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  const id = req.user.id;

  const user = await User.findById(id);
  console.log(user);
  if (!user) {
    throw new ApiError(401,"Invalid token")
  }
  if (user.isEmailVerified) {
    throw new ApiError(401,"Email already verified")
  }
  const emailVerificationToken = crypto.randomBytes(32).toString("hex");
  
  user.emailVerificationToken = "";
  await user.save();
  const hashedemailVerificationToken = crypto
    .createHash("sha256")
    .update(emailVerificationToken)
    .digest("hex");
  
  user.emailVerificationToken = hashedemailVerificationToken;
  await user.save();
  const emailUrl = `${process.env.BASE_URL}/api/v1/auth/verify-email/${emailVerificationToken}`;
  await sendEmail({
    email: req.user.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      req.user?.username,
      `${emailUrl}`
    ),
  });
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Email Verification link sent"));
});


const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token not found");
  }

  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    console.error("Token verification error:", err);

    if (err.name === "TokenExpiredError") {
     throw new ApiError(401,"Refresh token expired");
    }
    else {
      throw new ApiError(401,"Invalid token")
    }
  }

  const user = await User.findById(payload.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  console.log(user.refreshToken);
  console.log(refreshToken);

  if (user.refreshToken !== refreshToken) {
    throw new ApiError(403,"Token do not match")
  }

  const newAccessToken = jwt.sign(
    { id: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );

  const newRefreshToken = jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );

  user.refreshToken = newRefreshToken;
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

  return res
    .cookie("accessToken", newAccessToken, cookieOptions)
    .cookie("refreshToken", newRefreshToken, cookie2Options)
    .status(200)
    .json(
      new ApiResponse(
        200,
        { accessToken: newAccessToken },
        "New tokens generated"
      )
    );
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401,"Invalid token")
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
  res
    .status(200)
    .json(new ApiResponse(200, null, "Check your inbox for reset url"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { resetToken: token } = req.params;
  const { password, confirmPassword } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  // console.log(hashedToken)

  const user = await User.findOne({
    forgotPassword: hashedToken,
    forgotPasswordExpiry: { $gt: Date.now() },
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

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "",
        "Password reset successfully. You can log in now."
      )
    );
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  console.log(user);

  if (!user) {
    throw new ApiError(401,"Invalid token")
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
  verifyEmail
};
