import mongoose from "mongoose";

const activeAccessAssignmentSchema = new mongoose.Schema(
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
    activeAt: {
      type: Date,
      default: Date.now,
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
    sourceRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccessRequest",
    },
    pendingRevocation: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "ActiveAccessAssignment",
  activeAccessAssignmentSchema
);
