import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
  department: {
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

export default mongoose.model("Department", departmentSchema);
