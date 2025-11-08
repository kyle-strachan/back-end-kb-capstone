import mongoose from "mongoose";

const systemCategorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
});

export default mongoose.model("SystemCategory", systemCategorySchema);
