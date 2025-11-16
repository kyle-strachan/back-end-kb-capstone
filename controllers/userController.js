import User from "../models/users.js";
import SystemApplication from "../models/configSystemApplications.js";
import { isValidObjectId, validateObjectIdArray } from "../utils/validation.js";
import { processRevocations } from "./uacController.js";
import ActiveAccessAssignment from "../models/activeAccessAssignments.js";

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
  // TO DO: LOCATION

  // Permission check
  const hasPermission = req.user.permissions.includes("userCanRegister");
  const isSuperAdmin = req.user.isSuperAdmin;
  if (!hasPermission && !isSuperAdmin) {
    return res
      .status(403)
      .json({ message: `User has insufficient permissions.` });
  }

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

    const existingUsername = await User.findOne({
      username: username.toLowerCase().trim(),
    });
    if (existingUsername) {
      return res.status(400).json({ message: `Username already exists.` });
    }

    await User.create({
      username: username.toLowerCase().trim(),
      fullName: fullName.trim(),
      location,
      department,
      email: email.toLowerCase().trim(),
      position: position.trim(),
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

  // Permission check
  const hasPermission = req.user.permissions.includes("userCanEdit");
  const isSuperAdmin = req.user.isSuperAdmin;
  if (!hasPermission && !isSuperAdmin) {
    return res
      .status(403)
      .json({ message: `User has insufficient permissions.` });
  }

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

export async function terminateUser(req, res, next) {
  // Permission check
  const hasPermission = req.user.permissions.includes("userCanTerminate");
  const isSuperAdmin = req.user.isSuperAdmin;
  if (!hasPermission && !isSuperAdmin) {
    return res
      .status(403)
      .json({ message: `User has insufficient permissions.` });
  }

  const requestedBy = req.user._id;
  const userId = req.params.id;

  // Validate input from front-end
  if (!isValidObjectId(userId)) {
    return res
      .status(400)
      .json({ message: `UserId to update is not a valid ObjectId.` });
  }

  if (requestedBy === userId) {
    return res
      .status(400)
      .json({ message: `User cannot terminate own profile.` });
  }

  try {
    // Get user object
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: `UserId does not exist` });
    }

    // Get all active access assignments for user
    const assignments = await ActiveAccessAssignment.find({ userId });

    // Get array of IDs for revocation flow
    const assignmentIds = assignments.map((a) => a._id.toString());

    // Create revocation requests
    const results = await processRevocations(assignmentIds, requestedBy);

    // Confirm user is not an admin of any systems
    const adminSystems = await SystemApplication.find({ adminUser: userId });
    if (adminSystems.length > 0) {
      return res
        .status(400)
        .json({ message: `User is an admin of an active system` });
    }

    // If not admin
    user.isActive = false;
    await user.save();

    return res.status(200).json({ message: "Processing complete", results });
  } catch (error) {
    next(error);
  }
}
