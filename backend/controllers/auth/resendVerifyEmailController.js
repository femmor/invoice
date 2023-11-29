import asyncHandler from "express-async-handler";
import User from "../../models/userModel.js";
import VerifyResetToken from "../../models/verifyResetTokenModel.js";
import sendEmail from "../../utils/sendEmail.js";

// @title Resend email verification tokens
// @route POST /api/v1/auth/resend_email_token
// @desc Resend verification email after 15 mins of expiration
// @access Public

const domainUrl = process.env.DOMAIN;
const { randomBytes } = await import("crypto");

const resendEmailVerificationToken = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  // Check if email
  if (!email) {
    res.status(400);
    throw new Error("An email must be provided");
  }

  // Check if user exists
  if (!user) {
    res.status(400);
    throw new Error("We were unable to find a user with that email address");
  }

  // Check if user is already verified
  if (user.isEmailVerified) {
    res.status(400).send("This user has already been verified. Please login");
  }

  let verificationToken = await VerifyResetToken.findOne({
    _userId: user._id,
  });

  // Check if user token exists
  if (!verificationToken) {
    await VerifyResetToken.deleteOne();
  }

  const resentToken = randomBytes(32).toString("hex");

  let emailToken = await new VerifyResetToken({
    _userId: user._id,
    token: resentToken,
  }).save();

  // Create email link
  const emailLink = `${domainUrl}/api/v1/auth/verify/${emailToken.token}/${user._id}`;

  const payload = {
    name: user.firstName,
    link: emailLink,
  };

  // Send verification email
  await sendEmail(
    user.email,
    "Account Verification",
    payload,
    "./emails/template/accountVerification.handlebars"
  );

  res.status(200).json({
    success: true,
    message: `Hi ${user.firstName}, A verification email has been sent to your account. Please verify within 15 minutes.`,
  });
});

export default resendEmailVerificationToken;
