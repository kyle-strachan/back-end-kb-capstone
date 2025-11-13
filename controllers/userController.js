import User from "../models/users.js";
import { validateObjectIdArray } from "../utils/validation.js";

export async function getUsers(req, res, next) {
  try {
    const users = await User.find()
      .select("-passwordHash")
      .sort({ fullName: 1 });
    if (!users || users.length === 0) {
      return res.status(404).json({ message: `No users found.` });
    }
    return res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
}

export async function registerUser(req, res, next) {
  try {
    const {
      username,
      fullName,
      location,
      department,
      email,
      position,
      password,
      permissions,
    } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ message: "Full name is required." });
    }

    if (!position || !position.trim()) {
      return res.status(400).json({ message: "Position is required." });
    }

    if (!location || !location.trim()) {
      return res.status(400).json({ message: "Location is required." });
    }

    debugger;

    const minimumDepartments = 1;
    const departmentError = validateObjectIdArray(
      department,
      "Department",
      minimumDepartments
    );
    if (departmentError)
      return res.status(400).json({ message: `${departmentError}` });

    const minimumPermissions = 0;
    const permissionsError = validateObjectIdArray(
      permissions,
      "Permission",
      minimumPermissions
    );
    if (permissionsError) {
      return res.status(400).json({ message: `${permissionsError}` });
    }

    await User.create({
      username,
      fullName,
      location,
      department,
      email,
      position,
      passwordHash: password,
      permissions,
    });
    return res
      .status(200)
      .json({ message: `${username} successfully created.` });
  } catch (error) {
    next(error);
  }
}

export async function editUser(req, res, next) {
  // Admin only to edit any part of user (except username). Password handled separately.
  // debugger;
  try {
    const {
      fullName,
      location,
      isActive,
      department,
      email,
      position,
      permissions,
    } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ message: "Full name is required." });
    }

    if (!position || !position.trim()) {
      return res.status(400).json({ message: "Position is required." });
    }

    if (!location || !location.trim()) {
      return res.status(400).json({ message: "Location is required." });
    }

    const minimumDepartments = 1;
    const departmentError = validateObjectIdArray(
      department,
      "Department",
      minimumDepartments
    );
    if (departmentError) {
      return res.status(400).json({ message: `${departmentError}` });
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

    const editUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        fullName,
        location,
        department,
        email,
        position,
        permissions,
        isActive,
      },
      { runValidators: true, new: true }
    );

    if (!editUser) {
      res.status(400).json({ message: "User not found." });
    }

    return res
      .status(200)
      .json({ message: `${editUser.username} has been updated successfully.` });
  } catch (error) {
    next(error);
  }
}
