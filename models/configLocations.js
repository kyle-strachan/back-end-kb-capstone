import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  location: {
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
});

export default mongoose.model("Location", locationSchema);
