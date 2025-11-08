import mongoose from "mongoose";

const authLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  actionAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  actionType: {
    type: String,
    enum: [
      "LoginFailure",
      "LoginSuccess",
      "PasswordChange",
      "PermissionChange",
    ],
  },
  systemNote: {
    type: String,
    trim: true,
  },
  ip: {
    type: String,
    trim: true,
  },
});

export default mongoose.model("AuthLog", authLogSchema);
