import mongoose, { Schema } from 'mongoose';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: [true, 'Username is required'],
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [20, 'Username must be at most 20 characters'],
      unique: [true, 'Username already exists'],
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    refreshToken: {
      type: String,
    }
  },
  { timestamps: true } // Creates createdAt and updatedAt fields
);

userSchema.pre('save', async function (next) {
  // Hashing the password before saving
  if (this.isModified('password')) {
    this.password = await bcryptjs.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function(password) {
  // Compare the password with the hashed password
  return await bcryptjs.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function() {
  // Generates an access token which is short lived
  return jwt.sign({
    _id: this._id,
    userName: this.userName,
    email: this.email,
  }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
}

userSchema.methods.generateRefreshToken = function() {
  // Generates a refresh token which is long lived
  return jwt.sign({
    _id: this._id,
  }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
}

export const User = mongoose.model('User', userSchema);
