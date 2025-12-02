import { isValidObjectId } from "../utils/validation.js";
import Department from "../models/configDepartments.js";
import { MINIMUM_DEPARTMENT_LENGTH } from "../utils/constants.js";

export async function getDepartments(req, res, next) {
  try {
    const departments = await Department.find().sort({ department: 1 }).lean();
    if (!departments || departments.length === 0) {
      return res.status(404).json({ message: `No departments found.` });
    }
    return res.status(200).json({ departments });
  } catch (error) {
    next(error);
  }
}

export async function newDepartment(req, res, next) {
  try {
    const { department } = req.body;
    if (typeof department !== "string") {
      return res.status(400).json({ message: "Invalid department name." });
    }
    const trimmedDepartment = department?.trim();

    // Validate inputs
    if (
      !trimmedDepartment ||
      trimmedDepartment.length < MINIMUM_DEPARTMENT_LENGTH
    ) {
      return res.status(400).json({
        message: `A new department must have at least ${MINIMUM_DEPARTMENT_LENGTH} characters.`,
      });
    }

    // Create new department
    await Department.create({
      department: trimmedDepartment,
    });
    return res
      .status(200)
      .json({ message: `${trimmedDepartment} successfully created.` });
  } catch (error) {
    next(error);
  }
}

export async function editDepartments(req, res, next) {
  try {
    const updates = req.body.updates;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: "No updates provided." });
    }

    // Create array for results, allows multiple edits in one go.
    const results = [];

    // Validate batch promises
    for (const update of updates) {
      // Check department is string
      const department =
        typeof update.department === "string" ? update.department.trim() : "";

      // Check id and deparment exists
      if (!update._id || !isValidObjectId(update._id) || !department) {
        results.push({
          id: update._id,
          success: false,
          message: "Invalid ID or department name.",
        });
        continue;
      }

      // Check department length, update results table if failed
      if (department.length < MINIMUM_DEPARTMENT_LENGTH) {
        results.push({
          id: update._id,
          success: false,
          message: `Department name must be at least ${MINIMUM_DEPARTMENT_LENGTH} characters.`,
        });
        continue;
      }

      try {
        // Ensure isActive is true boolean
        const result = await Department.findByIdAndUpdate(
          update._id,
          {
            department,
            ...(update.isActive !== undefined && {
              isActive: Boolean(
                update.isActive === true || update.isActive === "true"
              ),
            }),
          },
          { runValidators: true, new: true, strict: "throw" } // Force rejecting for extra fields
        );

        // If no found department, update results table with failure
        if (!result) {
          results.push({
            id: update._id,
            success: false,
            message: "No matching department ID found.",
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
