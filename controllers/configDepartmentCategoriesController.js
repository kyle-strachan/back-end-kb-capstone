import DepartmentCategory from "../models/configDepartmentCategories.js";

export async function getDepartmentCategories(req, res, next) {
  try {
    const { permissions, department } = req.user;
    let filter = {};

    const canViewAll = user.permissions.includes(
      "configCanViewAllDepartmentCategories"
    );
    const canViewOwn = user.permissions.includes(
      "configCanViewOwnDepartmentCategories"
    );
    const isSuperAdmin = user.permissions.includes("isSuperAdmin");

    if (canViewAll || isSuperAdmin) {
      // no filter required
      filter = {};
    } else if (
      canViewOwn &&
      Array.isArray(department) &&
      department.length > 0
    ) {
      // limit to user's own department
      filter = { departmentId: { $in: department } };
    } else {
      return res.status(403).json({ message: "Access denied." });
    }

    // TODO: Front end must handle empty results.
    const categories = await DepartmentCategory.find(filter)
      .populate("departmentId", "name") // populate department name only
      .sort({ categoryName: 1 });

    return res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
}

export async function newDepartmentCategory(req, res, next) {
  try {
  } catch (error) {
    next(error);
  }
}

export async function editDepartmentCategory(req, res, next) {
  try {
  } catch (error) {
    next(error);
  }
}
