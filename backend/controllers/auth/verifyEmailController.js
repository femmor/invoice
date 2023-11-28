import asyncHandler from "express-async-handler";
import User from "../../models/userModel.js";
import VerifyResetToken from "../../models/verifyResetTokenModel.js";
import sendEmail from "../../utils/sendEmail.js";

const domainUrl = process.env.DOMAIN;

// @title Verify user email
// @route GET api/v1/auth/verify/:emailToken/:userId
// @desc Verify registered user email
// @access Public

const verifyUserEmail = asyncHandler(async (req, res) => {
  const { emailToken, userId } = req.params;

  const user = await User.findOne({ _id: userId }).select("-passwordConfirm");

  // Check if user exists
  if (!user) {
    res.status(404);
    throw new Error("We were unable to find a user for this token.");
  }

  // Check if user is already verified
  if (user.isEmailVerified) {
    res.status(400).send("This user has already been verified. Please login");
  }

  const userToken = await VerifyResetToken.findOne({
    _userId: user._id,
    token: emailToken,
  });

  // Check if user token exists
  if (!userToken) {
    res.status(400);
    throw new Error("Token invalid! Your token may have expired");
  }

  user.isEmailVerified = true;
  // Save updated user to database
  await user.save();

  // Send verification email if user is verified
  if (user.isEmailVerified) {
    const emailLink = `${domainUrl}/login`;
    const payload = {
      name: user.firstName,
      link: emailLink,
    };

    await sendEmail(
      user.email,
      "Welcome - Account Verified",
      payload,
      "./emails/template/welcome.handlebars"
    );

    res.redirect("/auth/verify");
  }
});

export default verifyUserEmail;
