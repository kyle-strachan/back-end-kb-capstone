import mongoose from "mongoose";

const docsCategorySchema = new mongoose.Schema({
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  category: {
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
docsCategorySchema.index({ departmentId: 1, category: 1 }, { unique: true });

export default mongoose.model("DocsCategory", docsCategorySchema);
