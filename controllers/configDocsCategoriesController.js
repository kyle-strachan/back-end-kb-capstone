import DocsCategory from "../models/configDocsCategories.js";
import { isValidObjectId } from "../utils/validation.js";
import { MINIMUM_DEPARTMENT_CATEGORY_LENGTH } from "../utils/constants.js";

export async function getDocsCategories(req, res, next) {
  try {
    const { departmentId, isActive } = req.query;

    // SuperAdmin and SystemAdmin can view all
    const viewAll =
      req.user.isSuperAdmin || req.user.roles.includes("SystemAdmin");

    // Regular users: only categories where their department matches
    const filter = viewAll
      ? {}
      : { departmentId: { $in: req.user.department } };

    // Optional additional filtering
    if (departmentId) {
      filter.departmentId = departmentId;
    }

    if (typeof isActive !== "undefined") {
      filter.isActive = isActive === "true";
    }

    let docsCategories = await DocsCategory.find(filter)
      .populate("departmentId", "department")
      .lean();

    // Sort by department name then category name
    docsCategories.sort((a, b) => {
      const depA = a.departmentId?.department || "";
      const depB = b.departmentId?.department || "";

      const depCompare = depA.localeCompare(depB);
      if (depCompare !== 0) return depCompare;

      return a.category.localeCompare(b.category);
    });

    return res.status(200).json({ docsCategories });
  } catch (error) {
    next(error);
  }
}

export async function newDocsCategory(req, res, next) {
  try {
    const { departmentId, category } = req.body;
    if (typeof category !== "string") {
      return res.status(400).json({ message: "Invalid category name." });
    }
    const trimmedCategory = category?.trim();

    // Validate inputs
    if (
      !trimmedCategory ||
      trimmedCategory.length < MINIMUM_DEPARTMENT_CATEGORY_LENGTH
    ) {
      return res.status(400).json({
        message: `Department category must be at least ${MINIMUM_DEPARTMENT_CATEGORY_LENGTH} characters.`,
      });
    }

    if (!departmentId || !isValidObjectId(departmentId)) {
      return res
        .status(400)
        .json({ message: `Department ID is invalid, cannot insert.` });
    }

    // Check user is a member of this department
    const canCreate =
      req.user.isSuperAdmin || req.user.department.includes(departmentId);

    // Reject is user is not a member.
    if (!canCreate) {
      return res.status(400).json({
        message: `Cannot create category, user is not a member of this department.`,
      });
    }

    const newCategory = await DocsCategory.create({
      departmentId,
      category: trimmedCategory,
    });
    if (!newCategory) {
      return res
        .status(400)
        .json({ message: `Could not create new documents category.` });
    }

    return res
      .status(200)
      .json({ message: `${trimmedCategory} created successfully.` });
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

    // Create array for results, allows multiple edits in one api call.
    const results = [];

    // Validate batch changes
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

      // Check category length, update results table if failed
      if (category.length < MINIMUM_DEPARTMENT_CATEGORY_LENGTH) {
        results.push({
          id: update._id,
          success: false,
          message: `Document category name must be at least ${MINIMUM_DEPARTMENT_CATEGORY_LENGTH} characters`,
        });
        continue;
      }

      // Check user can update this category
      // Ensure comparing a string and not object.
      const updateDeptId =
        update.departmentId && typeof update.departmentId === "object"
          ? update.departmentId._id
          : update.departmentId;

      const canEdit =
        req.user.isSuperAdmin ||
        (updateDeptId &&
          req.user.department.some((depId) => depId.equals(updateDeptId)));

      if (!canEdit) {
        results.push({
          id: update._id,
          success: false,
          message: `User cannot update categories of this department.`,
        });
        continue;
      }

      try {
        const result = await DocsCategory.findByIdAndUpdate(
          update._id,
          {
            category: category,
            ...(update.isActive !== undefined && {
              isActive: update.isActive === true || update.isActive === "true", // Ensure isActive is true boolean
            }),
          },
          { runValidators: true, new: true, strict: "throw" } // Force rejecting for extra fields
        );

        // If no found category found to update, update results table with failure
        if (!result) {
          results.push({
            id: update._id,
            success: false,
            message: `No matching document category found to update.`,
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
