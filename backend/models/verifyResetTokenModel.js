import { Schema, model } from "mongoose";

const verifyResetTokenSchema = new Schema({
  _userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 900,
  },
});

const VerifyResetToken = model("VerifyResetToken", verifyResetTokenSchema);

export default VerifyResetToken;
