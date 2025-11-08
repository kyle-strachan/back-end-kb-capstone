import mongoose from "mongoose";

const systemApplicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  category: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SystemCategory",
      },
    ],
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  adminUser: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    required: true,
  },
  sendEmail: {
    type: Boolean,
    required: true,
  },
  description: {
    type: String,
  },
});

export default mongoose.model("SystemApplication", systemApplicationSchema);
