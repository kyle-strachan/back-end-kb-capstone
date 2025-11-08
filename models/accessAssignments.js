import mongoose from "mongoose";

const accessAssignmentSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ["Active", "Revoked"],
      required: true,
    },
    completedAt: {
      type: Date,
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    notes: {
      type: String,
      trim: true,
    },
    changeReason: {
      type: String,
      trim: true,
    },
    sourceRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccessRequest",
    },
  },
  { timestamps: true }
);

export default mongoose.model("AccessAssignment", accessAssignmentSchema);
