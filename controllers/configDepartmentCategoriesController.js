import DepartmentCategory from "../models/configDepartmentCategories.js";

export async function getDepartmentCategories(req, res, next) {
  try {
    const { user } = req;
    const { permissions, department } = req.user;
    let filter = {};

    console.log(
      "Type:",
      typeof permissions,
      "isArray:",
      Array.isArray(permissions),
      "value:",
      permissions
    );

    const permissionNames = user.permissions.map((p) => p.permissionName);
    const canViewAll = permissionNames.includes(
      "configCanViewAllDepartmentCategories"
    );
    const canViewOwn = permissionNames.includes(
      "configCanViewOwnDepartmentCategories"
    );
    const isSuperAdmin = permissionNames.includes("isSuperAdmin");

    if (canViewAll || isSuperAdmin) {
      filter = {}; // no filter required
    } else if (
      canViewOwn &&
      Array.isArray(department) &&
      department.length > 0
    ) {
      filter = { departmentId: { $in: department } }; // limit to user's own department
    } else {
      return res.status(403).json({ message: "Access denied." });
    }

    // debugger;
    const categories = await DepartmentCategory.find(filter)
      .populate("departmentId", "name")
      .sort({ categoryName: 1 });

    console.log(categories);
    return res.status(200).json({ categories });
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
