import asyncHandler from "express-async-handler";
import User from "../../models/userModel.js";
import jwt from "jsonwebtoken";

// @title Refresh token
// @route GET /api/v1/auth/new_access_token
// @desc Gets new access token from the refresh token - Rotating the refresh token, deleting old ones, creating new ones and detecting token reuse
// @access Public

const options = {
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  secure: true,
  sameSite: "None",
};

// Reusable function to clear refresh token cookie
const clearRefreshTokenCookie = (res) => {
  res.clearCookie("jwt", options);
};

// Verify and decode the JWT token
const verifyRefreshToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_REFRESH_SECRET_KEY, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
};

const newAccessToken = asyncHandler(async (req, res) => {
  const { jwt: refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.sendStatus(401);
  }

  try {
    // Looks up the existing user by their refresh token
    const existingUser = await User.findOne({ refreshToken }).exec();

    if (!existingUser) {
      clearRefreshTokenCookie(res);
      return res.sendStatus(403); // No user found
    }

    const decoded = await verifyRefreshToken(refreshToken);

    if (existingUser._id.toString() !== decoded.id) {
      return res.sendStatus(403); // Token does not belong to this user
    }

    // Generate new access and refresh tokens
    const accessToken = jwt.sign(
      { id: existingUser._id, roles: existingUser.roles },
      process.env.JWT_ACCESS_SECRET_KEY,
      { expiresIn: "1h" }
    );

    const newRefreshToken = jwt.sign(
      { id: existingUser._id },
      process.env.JWT_REFRESH_SECRET_KEY,
      { expiresIn: "1h" }
    );

    // Update user with the new refresh token and save
    existingUser.refreshToken = [
      ...existingUser.refreshToken.filter((rt) => rt !== refreshToken),
      newRefreshToken,
    ];
    await existingUser.save();

    // Set the new refresh token as a cookie
    res.cookie("jwt", newRefreshToken, options);

    // Send the new access token to the user
    res.json({
      success: true,
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      username: existingUser.username,
      provider: existingUser.provider,
      avatar: existingUser.avatar,
      accessToken,
    });
  } catch (error) {
    clearRefreshTokenCookie(res);

    // If token verification fails, respond with 403 Forbidden
    res.sendStatus(403);
  }
});

export default newAccessToken;
