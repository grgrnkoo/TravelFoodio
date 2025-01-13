import mongoose from "mongoose";

const AccountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true },
  provider: { type: String, required: true },
  providerAccountId: { type: String, required: true },
  access_token: String,
  expires_at: Number,
  refresh_token: String,
  scope: String,
  token_type: String,
});

export default mongoose.models.Account ||
  mongoose.model("Account", AccountSchema);
