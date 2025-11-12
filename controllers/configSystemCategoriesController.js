import SystemCategory from "../models/configSystemCategories.js";

const minimumCategoryCharacterLength = 3;

export async function getSystemCategories(req, res, next) {
  // debugger;
  try {
    const systemCategories = await SystemCategory.find().sort({ name: 1 });
    if (!systemCategories || systemCategories.length === 0) {
      return res.status(404).json({ message: `No applications found.` });
    }
    return res.status(200).json({ systemCategories });
  } catch (error) {
    next(error);
  }
}

export async function newSystemCategory(req, res, next) {
  // debugger;
  try {
    const { category } = req.body;

    if (!category || !category.trim()) {
      return res.status(400).json({ message: "Invalid category name." });
    }

    await SystemCategory.create({
      category,
    });
    return res
      .status(201)
      .json({ message: `${category} successfully created.` });
  } catch (error) {
    next(error);
  }
}

export async function editSystemCategory(req, res, next) {
  // debugger;
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
      // Check category name is long enough.
      // debugger;
      if (update.category.trim().length < minimumCategoryCharacterLength) {
        results.push({
          id: update._id,
          success: false,
          message: `Category name must be at least ${minimumCategoryCharacterLength} characters`,
        });
        continue;
      }

      try {
        const result = await SystemCategory.findByIdAndUpdate(
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
            message: `No matching system category ID found.`,
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
