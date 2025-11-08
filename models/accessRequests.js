import mongoose from "mongoose";

const accessRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SystemApplication",
      required: true,
    },
    requestType: {
      type: String,
      enum: ["Activate", "Revoke"],
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    requestNote: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["New", "Approved", "Denied", "Withdrawn"],
      required: true,
      default: "New",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("AccessRequest", accessRequestSchema);
