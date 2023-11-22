import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const checkAuth = asyncHandler(async (req, res, next) => {
  // Create a variable from the token in the header

  let jwt_token;

  // Bearer
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader) {
    res.status(401);
    throw new Error("Not authorized");
  }

  if (authHeader && authHeader.startsWith("Bearer")) {
    jwt_token = authHeader.split(" ")[1];

    // Verify the token
    jwt.verify(
      jwt_token,
      process.env.JWT_ACCESS_SECRET_KEY,
      async (err, decoded) => {
        if (err) {
          res.status(403);
          throw new Error("Invalid token");
        }
        const userId = decoded.id;
        req.user = await User.findById(userId).select("-password");
        req.roles = decoded.roles;
        next();
      }
    );
  }
});
