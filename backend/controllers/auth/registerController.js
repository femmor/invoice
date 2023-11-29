import asyncHandler from "express-async-handler";
import User from "../../models/userModel.js";
import VerifyResetToken from "../../models/verifyResetTokenModel.js";
import sendEmail from "../../utils/sendEmail.js";

const domainUrl = process.env.DOMAIN;
const { randomBytes } = await import("crypto");

// @title Register user
// @route POST api/v1/auth/register
// @desc Register user and send email verification link
// @access Public

export const registerUser = asyncHandler(async (req, res) => {
  const { email, username, firstName, lastName, password, passwordConfirm } =
    req.body;

  // Check if no email
  if (!email) {
    res.status(400);
    throw new Error("Email address is required");
  }

  // Check if no username
  if (!username) {
    res.status(400);
    throw new Error("Username is required");
  }

  // Check if no first name and last name
  if (!firstName || !lastName) {
    res.status(400);
    throw new Error("Please enter a first name and last name");
  }

  // Check if no password
  if (!password) {
    res.status(400);
    throw new Error("Password is required");
  }

  // Check if no password confirm
  if (!passwordConfirm) {
    res.status(400);
    throw new Error("Password confirm is required");
  }

  // Check if password and password confirm do not match
  if (password !== passwordConfirm) {
    res.status(400);
    throw new Error("Password and password confirm do not match");
  }

  // Check if email already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("The email address is already in use by another user");
  }

  const newUser = new User({
    email,
    username,
    firstName,
    lastName,
    password,
    passwordConfirm,
  });

  const registeredUser = await newUser.save();

  // Check if the user is registered
  if (!registeredUser) {
    res.status(400);
    throw new Error("User could not be registered");
  }

  // Send verification email
  const verificationToken = randomBytes(32).toString("hex");

  let emailVerificationToken = await new VerifyResetToken({
    _userId: registeredUser._id,
    token: verificationToken,
  }).save();

  // Create email link
  const emailLink = `${domainUrl}/api/v1/auth/verify/${emailVerificationToken.token}/${registeredUser._id}`;

  const payload = {
    name: registeredUser.firstName,
    link: emailLink,
  };

  // Send verification email
  await sendEmail(
    registeredUser.email,
    "Account Verification",
    payload,
    "./emails/template/accountVerification.handlebars"
  );

  res.status(201).json({
    success: true,
    message: `A new user ${registeredUser.firstName} has been registered! A verification email has been sent to your account. Please verify within 15 minutes.`,
  });
});

export default registerUser;
