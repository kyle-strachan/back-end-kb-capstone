import PlatformRole from "../models/configPlatformRoles.js";
import { validateObjectIdArray } from "../utils/validation.js";

export async function getPlatformRoles(req, res, next) {
  // Permission check
  // const hasPermission = req.user.permissions.includes("systemsCanManage");
  // const isSuperAdmin = req.user.isSuperAdmin;
  // if (!hasPermission && !isSuperAdmin) {
  //   return res
  //     .status(403)
  //     .json({ message: `User has insufficient permissions.` });
  // }
  try {
    const platformRoles = await PlatformRole.find().sort({ roleName: 1 });
    if (!platformRoles || platformRoles.length === 0) {
      return res.status(404).json({ message: `No platform roles found.` });
    }
    return res.status(200).json(platformRoles);
  } catch (error) {
    next(error);
  }
}

export async function newPlatformRole(req, res, next) {
  // Permission check
  // const hasPermission = req.user.permissions.includes("systemsCanManage");
  // const isSuperAdmin = req.user.isSuperAdmin;
  // if (!hasPermission && !isSuperAdmin) {
  //   return res
  //     .status(403)
  //     .json({ message: `User has insufficient permissions.` });
  // }
  try {
    const { roleName, description, permissions } = req.body;

    if (!roleName || !roleName.trim()) {
      return res
        .status(400)
        .json({ message: "Platform role name is required." });
    }

    const minimumPermissions = 0;
    const permissionsError = validateObjectIdArray(
      permissions,
      "Permission",
      minimumPermissions
    );
    if (permissionsError) {
      return res.status(400).json({ message: `${permissionsError}` });
    }

    await PlatformRole.create({
      roleName,
      description,
      isActive: true,
      permissions,
    });
    return res
      .status(201)
      .json({ message: `${roleName} successfully created.` });
  } catch (error) {
    next(error);
  }
}

export async function editPlatformRole(req, res, next) {
  // Permission check
  // const hasPermission = req.user.permissions.includes("systemsCanManage");
  // const isSuperAdmin = req.user.isSuperAdmin;
  // if (!hasPermission && !isSuperAdmin) {
  //   return res
  //     .status(403)
  //     .json({ message: `User has insufficient permissions.` });
  // }
  try {
    const { roleName, description, isActive, permissions } = req.body;

    if (!roleName || !roleName.trim()) {
      return res
        .status(400)
        .json({ message: "Platform role name is required." });
    }

    const minimumPermissions = 0;
    const permissionsError = validateObjectIdArray(
      permissions,
      "Permission",
      minimumPermissions
    );
    if (permissionsError) {
      return res.status(400).json({ message: `${permissionsError}` });
    }
    const updatedRole = await PlatformRole.findByIdAndUpdate(
      req.params.id,
      {
        roleName,
        description,
        isActive,
        permissions,
      },
      { new: true, runValidators: true }
    );

    if (!updatedRole) {
      return res.status(404).json({ message: "Platform role not found." });
    }
    return res
      .status(200)
      .json({ message: `${updatedRole.roleName} successfully updated.` });
  } catch (error) {
    next(error);
  }
}
