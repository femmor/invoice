import bcrypt from "bcryptjs";
import { Schema, model } from "mongoose";
import validator from "validator";
import { USER } from "../constants";

const userSchema = new Schema(
  {
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    username: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
      validate: {
        validator: (value) => /^[A-z][A-z0-9-_]{3,23}$/.test(value),
        message:
          "Username must be alphanumeric, without special characters. Hyphens and underscore allowed",
      },
    },
    firstName: {
      type: String,
      trim: true,
      required: true,
      validate: [
        validator.isAlphanumeric,
        "First name can only have alphanumeric values. No special characters allowed",
      ],
    },
    lastName: {
      type: String,
      trim: true,
      required: true,
      validate: [
        validator.isAlphanumeric,
        "Last name can only have alphanumeric values. No special characters allowed",
      ],
    },
    password: {
      type: String,
      required: true,
      select: false,
      validate: [
        validator.isStrongPassword,
        "Password must be at least 8 characters long, with at least 1 uppercase and lowercase letters and at least 1 symbol",
      ],
    },
    passwordConfirm: {
      type: String,
      validate: {
        validator: (value) => value === this.password,
        message: "Passwords do not match",
      },
    },
    isEmailVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    provider: {
      type: String,
      required: true,
      default: "email",
    },
    googleID: {
      type: String,
    },
    avatar: {
      type: String,
    },
    businessName: {
      type: String,
    },
    phoneNumber: {
      type: String,
      default: "+254123456789",
      validate: [
        validator.isMobilePhone,
        "Your phone number bust begin with a '+', followed by your country code then actual number e.g +254123456789",
      ],
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    country: {
      type: String,
    },
    passwordChangedAt: {
      type: Date,
    },
    role: {
      type: [String],
      default: [USER],
    },
    active: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: [String],
    },
  },
  { timestamps: true }
);

// Check if the user roles array is empty, push USER if empty before saving
userSchema.pre("save", async function (next) {
  if (this.roles.length === 0) {
    this.roles.push(USER);
    next();
  }
});

// Encrypt password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordConfirm = undefined;
  next();
});

// Update passwordChangedAt field
userSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    return next();
  }

  this.passwordChangedAt = Date.now();
  next();
});

// Compare given password with the hashed password
userSchema.methods.comparePassword = async function (givenPassword) {
  return await bcrypt.compare(givenPassword, this.password);
};

const User = model("User", userSchema);

export default User;
