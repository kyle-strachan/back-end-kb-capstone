import Permission from "../models/configPermissions.js";

// FOR DEV ONLY, WILL LIST PERMISSIONS OF USER

export async function getPermissions(req, res, next) {
  // Permission check
  const hasPermission = req.user.isSuperAdmin;
  if (!hasPermission) {
    return res
      .status(403)
      .json({ message: `User has insufficient permissions.` });
  }

  try {
    const permissions = await Permission.find().sort({ name: 1 });
    if (!permissions || permissions.length === 0) {
      return res.status(404).json({ message: `No permissions found.` });
    }
    return res.status(200).json({ permissions });
  } catch (error) {
    next(error);
  }
}
