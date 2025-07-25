import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto"
const UserSchema = new Schema(
  {
    avatar: {
      type: {
        url: String,
        localPath: String,
      },
      default: {
        url: `https://placehold.co/600x400`,
        localPath: "",
      },
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // to find through index
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      // to find through index
    },
    fullname: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    forgotPassword: {
      type: String,
    },
    forgotPasswordExpiry: {
      type: Date,
    },
    refreshToken: {
      type: String,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpiry: {
      type: Date,
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password,this.password)
}
UserSchema.methods.generateAccessToken =  function (){
    return jwt.sign(
        {
            _id : this._id,
            email: this.email,
            username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn : process.env.ACCESS_TOKEN_EXPIRY}
    )
}
UserSchema.methods.generateRefreshToken =  function (){
    return jwt.sign(
        {
            _id : this._id,
            
        },
        process.env.ACCESS_REFRESH_SECRET,
        {expiresIn : process.env.REFRESH_TOKEN_EXPIRY}

    )
}
UserSchema.methods.generateTemporaryToken = function () {
    const unHashedToken = crypto.randomBytes(20).toString("hex")

    const HashedToken = crypto.createHash("sha256").update(unHashedToken).digest("hex")
    const TokenExpiry = Date.now()+ (20*60*1000)
    return {HashedToken,unHashedToken,TokenExpiry}
}

export const User = mongoose.model("User", UserSchema);
