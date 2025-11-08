import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
  departmentName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  isAssignable: {
    type: Boolean,
    required: true,
    default: true,
  },
});

export default mongoose.model("Department", departmentSchema);
