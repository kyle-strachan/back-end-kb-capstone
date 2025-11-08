import Permission from "../models/configPermissions.js";

export async function getPermissions(req, res, next) {
  try {
    const permissions = await Permission.find().sort({ name: 1 });
    if (!permissions || permissions.length === 0) {
      return res.status(404).json({ message: `No permissions found.` });
    }
    return res.status(200).json(permissions);
  } catch (error) {
    next(error);
  }
}
