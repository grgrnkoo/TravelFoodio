import mongoose from "mongoose";

const VerificationTokenSchema = new mongoose.Schema({
  identifier: { type: String, required: true }, // Usually the user's email
  token: { type: String, required: true }, // Unique token sent via email
  expires: { type: Date, required: true }, // Token expiration time
});

export default mongoose.models.VerificationToken ||
  mongoose.model("VerificationToken", VerificationTokenSchema);