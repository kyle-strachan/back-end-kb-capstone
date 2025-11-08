import mongoose from "mongoose";

const businessRoleSchema = new mongoose.Schema({
  roleName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
  defaultAccessRequests: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SystemApplication",
      },
    ],
    description: {
      type: String,
    },
  },
});

export default mongoose.model("BusinessRole", businessRoleSchema);
