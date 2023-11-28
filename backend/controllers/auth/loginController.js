import asyncHandler from "express-async-handler";
import User from "../../models/userModel.js";
import jwt from "jsonwebtoken";
import { systemLogs } from "../../utils/Logger.js";

const domainUrl = process.env.DOMAIN;

// @title Login
// @route POST /api/v1/auth/login
// @desc Login user, get access and refresh tokens
// @access Public

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if no email or password
  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide an email and password");
  }

  // Check if user exists
  const existingUser = await User.findOne({ email }).select("+password");

  // Check if user does not exist or password does not exist
  if (!existingUser || !(await existingUser.comparePassword(password))) {
    systemLogs.error("Incorrect email or password");
    res.status(400);
    throw new Error("Incorrect email or password");
  }

  // Check if user email is not verified
  if (!existingUser.isEmailVerified) {
    systemLogs.error("Account is not verified");
    res.status(401);
    throw new Error(
      " You are not verified. Check your email, a verification email link was sent when you registered"
    );
  }

  // Check if user is active
  if (!existingUser.active) {
    res.status(400);
    throw new Error(
      "You have been deactivated by the admin and login is impossible. Contact us for enquiries."
    );
  }

  // Check if user exists and password is correct
  if (existingUser && (await existingUser.comparePassword(password))) {
    // Create access token
    const accessToken = jwt.sign(
      {
        id: existingUser._id,
        roles: existingUser.roles,
      },
      process.env.JWT_ACCESS_SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    // Create refresh token
    const newRefreshToken = jwt.sign(
      {
        id: existingUser._id,
      },
      process.env.JWT_REFRESH_SECRET_KEY,
      {
        expiresIn: "1d",
      }
    );

    // Get cookies from the request
    const cookies = req.cookies;
    let newRefreshTokenArray = !cookies?.jwt
      ? existingUser.refreshToken
      : existingUser.refreshToken.filter((refT) => refT !== cookies.jwt);

    // RefreshToken reuse
    if (cookies?.jwt) {
      const refreshToken = cookies.jwt;
      const existingRefreshToken = await User.findOne({ refreshToken }).exec();

      if (!existingRefreshToken) {
        // Clears out previous refresh token
        newRefreshTokenArray = [];
      }

      const options = {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        secure: true,
        sameSite: "None",
      };

      res.clearCookie("jwt", options);
    }

    existingUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
    await existingUser.save();

    const options = {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: "None",
    };

    // Creates the cookie and pass in the new refresh token
    res.cookie("jwt", newRefreshToken, options);

    res.json({
      success: true,
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      username: existingUser.username,
      provider: existingUser.provider,
      avatar: existingUser.avatar,
      accessToken,
    });
  }
});

export default loginUser;
