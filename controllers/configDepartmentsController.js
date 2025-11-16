import Department from "../models/configDepartments.js";

const minimumDepartmentCharacterLength = 3;

export async function getDepartments(req, res, next) {
  // No permission check required. Required to populate non-sensitive drop-down boxes.
  try {
    const departments = await Department.find().sort({ department: 1 });
    if (!departments || departments.length === 0) {
      return res.status(404).json({ message: `No departments found.` });
    }
    return res.status(200).json({ departments });
  } catch (error) {
    next(error);
  }
}

export async function newDepartment(req, res, next) {
  // Permission check
  const hasPermission = req.user.permissions.includes("departmentsCanManage");
  const isSuperAdmin = req.user.isSuperAdmin;
  if (!hasPermission && !isSuperAdmin) {
    return res
      .status(403)
      .json({ message: `User has insufficient permissions.` });
  }

  try {
    const { department } = req.body;
    await Department.create({
      department,
    });
    return res
      .status(200)
      .json({ message: `${department} successfully created.` });
  } catch (error) {
    next(error);
  }
}

export async function editDepartments(req, res, next) {
  // Permission check
  const hasPermission = req.user.permissions.includes("departmentsCanManage");
  const isSuperAdmin = req.user.isSuperAdmin;
  if (!hasPermission && !isSuperAdmin) {
    return res
      .status(403)
      .json({ message: `User has insufficient permissions.` });
  }

  try {
    const updates = req.body.updates;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: "No updates provided." });
    }

    const results = [];

    // Validate batch promises
    for (const update of updates) {
      if (!update._id || typeof update.department !== "string") {
        results.push({
          id: update._id,
          success: false,
          message: "Invalid ID or department name.",
        });
        continue;
      }
      // Check department name is long enough.
      // debugger;
      if (update.department.trim().length < minimumDepartmentCharacterLength) {
        results.push({
          id: update._id,
          success: false,
          message: `Department name must be at least ${minimumDepartmentCharacterLength} characters`,
        });
        continue;
      }

      try {
        const result = await Department.findByIdAndUpdate(
          update._id,
          {
            department: update.department.trim(),
            isActive: !!update.isActive, // in case field is not changed and is null
          },
          { runValidators: true, new: true, strict: "throw" }
        );
        if (!result) {
          results.push({
            id: update._id,
            success: false,
            message: `No matching department ID found.`,
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
