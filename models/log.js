import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  eventDescription: {
    type: String,
    required: true,
    trim: true,
  },
  user: {
    type: String,
    required: true,
    trim: true,
  },
});

export default mongoose.model("Log", logSchema);
