import DocsCategory from "../models/configDocsCategories.js";
import { isValidObjectId, validateObjectIdArray } from "../utils/validation.js";

const minimumDocumentCategoryLength = 3;

export async function getDocsCategories(req, res, next) {
  try {
    const { user } = req;
    const { departmentId } = req.query;
    let filter = {};
    if (departmentId) {
      filter = { departmentId: departmentId };
    }

    const docsCategories = await DocsCategory.find(filter)
      .populate("departmentId", "department")
      .sort({ categoryName: 1 })
      .lean();

    return res.status(200).json({ docsCategories });
  } catch (error) {
    next(error);
  }
}

export async function newDocsCategory(req, res, next) {
  try {
    const { departmentId, category } = req.body;

    const minimumDepartments = 1;
    const departmentError = validateObjectIdArray(
      departmentId,
      "DocsCategory",
      minimumDepartments
    );
    if (departmentError) {
      return res.status(400).json({ message: `DepartmentId is invalid.` });
    }

    if (category.length < 3) {
      return res
        .status(400)
        .json({ message: `Category must have a minimum of three characters.` });
    }

    const newCategory = await DocsCategory.create({ departmentId, category });
    if (!newCategory) {
      return res
        .status(400)
        .json({ message: `Could not create new documents category.` });
    }

    return res
      .status(200)
      .json({ message: `New document category created successfully.` });
  } catch (error) {
    next(error);
  }
}

export async function editDocsCategory(req, res, next) {
  try {
    const updates = req.body.updates;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: "No updates provided." });
    }

    const results = [];

    // Validate batch promises
    for (const update of updates) {
      if (!update._id || typeof update.category !== "string") {
        results.push({
          id: update._id,
          success: false,
          message: "Invalid ID or category name.",
        });
        continue;
      }
      // Check document category name is long enough.
      if (update.category.trim().length < minimumDocumentCategoryLength) {
        results.push({
          id: update._id,
          success: false,
          message: `Document category name must be at least ${minimumDocumentCategoryLength} characters`,
        });
        continue;
      }

      try {
        const result = await DocsCategory.findByIdAndUpdate(
          update._id,
          {
            category: update.category.trim(),
            isActive: !!update.isActive, // in case field is not changed and is null
          },
          { runValidators: true, new: true, strict: "throw" }
        );
        if (!result) {
          results.push({
            id: update._id,
            success: false,
            message: `No matching document category found.`,
          });
          return;
        }
        results.push({ id: update._id, success: true });
      } catch (error) {
        results.push({
          id: update._id,
          success: false,
          message: error.message,
        });
      }
    }

    res.status(200).json({
      message: "Batch processed.",
      results,
    });
  } catch (error) {
    next(error);
  }
}
