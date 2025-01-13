import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // This links the session to a specific user
  sessionToken: { type: String, required: true, unique: true }, // Unique session token
  expires: { type: Date, required: true }, // Expiration time for session
});

export default mongoose.models.Session || mongoose.model("Session", SessionSchema);
