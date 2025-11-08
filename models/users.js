import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  fullName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  location: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location",
        required: true,
      },
    ],
    validate: {
      validator: (v) => v.length > 0,
      message: "User must be associated with at least one location.",
    },
  },
  department: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: true,
      },
    ],
    validate: {
      validator: (v) => v.length > 0,
      message: "User must be associated with at least one department.",
    },
  },
  email: {
    type: String,
    trim: true,
  },
  position: {
    type: String,
    required: true,
    trim: true,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  passwordMustChange: {
    type: Boolean,
    required: true,
    default: true,
  },
  passwordUpdatedAt: {
    type: Date,
    default: Date.now,
  },
  passwordUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  lastLoginAt: {
    type: Date,
  },
  failedLoginCount: {
    type: Number,
  },
  tokenVersion: {
    type: Number,
  },
  permissions: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission",
      },
    ],
  },
  isSuperAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("passwordHash")) {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  }
  next();
});

export default mongoose.model("User", userSchema);
