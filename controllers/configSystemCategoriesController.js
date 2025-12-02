import SystemCategory from "../models/configSystemCategories.js";
import { MINIMUM_SYSTEM_CATEGORY_LENGTH } from "../utils/constants.js";
import { isValidObjectId } from "../utils/validation.js";

export async function getSystemCategories(req, res, next) {
  try {
    const systemCategories = await SystemCategory.find()
      .sort({ category: 1 })
      .lean();
    if (!systemCategories || systemCategories.length === 0) {
      return res.status(404).json({ message: `No system categories found.` });
    }
    return res.status(200).json({ systemCategories });
  } catch (error) {
    next(error);
  }
}

export async function newSystemCategory(req, res, next) {
  try {
    const { category } = req.body;
    if (typeof category !== "string") {
      return res.status(400).json({ message: "Invalid system category name." });
    }
    const trimmedCategory = category?.trim();

    // Validate inputs
    if (
      !trimmedCategory ||
      trimmedCategory.length < MINIMUM_SYSTEM_CATEGORY_LENGTH
    ) {
      return res.status(400).json({
        message: `A new system category must have at least ${MINIMUM_SYSTEM_CATEGORY_LENGTH} characters.`,
      });
    }

    // Create new system category
    await SystemCategory.create({
      category: trimmedCategory,
    });
    return res
      .status(201)
      .json({ message: `${trimmedCategory} created successfully.` });
  } catch (error) {
    next(error);
  }
}

export async function editSystemCategory(req, res, next) {
  try {
    const updates = req.body.updates;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: "No updates provided." });
    }

    // Create array for results, allows multiple edits in one api call.
    const results = [];

    // Validate batch promises
    for (const update of updates) {
      // Check category is string
      const category =
        typeof update.category === "string" ? update.category.trim() : "";

      // Check id and category value
      if (!update._id || !isValidObjectId(update._id) || !category) {
        results.push({
          id: update._id,
          success: false,
          message: "Invalid ID or category name.",
        });
        continue;
      }

      // Check category name is long enough.
      if (category.length < MINIMUM_SYSTEM_CATEGORY_LENGTH) {
        results.push({
          id: update._id,
          success: false,
          message: `Category name must be at least ${MINIMUM_SYSTEM_CATEGORY_LENGTH} characters`,
        });
        continue;
      }

      try {
        const result = await SystemCategory.findByIdAndUpdate(
          update._id,
          {
            category,
            ...(update.isActive !== undefined && {
              isActive: Boolean(
                update.isActive === true || update.isActive === "true" // Ensure isActive is true boolean
              ),
            }),
          },
          { runValidators: true, new: true, strict: "throw" } // Force reject extra fields
        );
        if (!result) {
          results.push({
            id: update._id,
            success: false,
            message: `No matching system category ID found.`,
          });
          continue;
        }

        // Success, update results table
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
      message: "Updates processed.",
      results,
    });
  } catch (error) {
    next(error);
  }
}
