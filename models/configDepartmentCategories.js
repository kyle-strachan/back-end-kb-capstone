import mongoose from "mongoose";

const departmentCategorySchema = new mongoose.Schema({
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  categoryName: {
    type: String,
    required: true,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

// Each department can have the same category, but enforce uniqueness on departmentId + categoryName
departmentCategorySchema.index(
  { departmentId: 1, categoryName: 1 },
  { unique: true }
);

export default mongoose.model("DepartmentCategory", departmentCategorySchema);
