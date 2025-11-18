import mongoose from "mongoose";

const docSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  body: {
    type: String,
    required: true,
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  lastModifiedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  docsCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DocsCategory",
    required: true,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("Doc", docSchema);
