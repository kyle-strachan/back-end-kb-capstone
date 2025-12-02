import User from "../models/users.js";
import SystemApplication from "../models/configSystemApplications.js";
import { isValidObjectId, validateObjectIdArray } from "../utils/validation.js";
import { processRevocations } from "./uacController.js";
import ActiveAccessAssignment from "../models/activeAccessAssignments.js";
import {
  USERNAME_MIN_LENGTH,
  PASSWORD_MIN_LENGTH,
  MINIMUM_DEPARTMENTS,
} from "../utils/constants.js";

export async function getUsers(req, res, next) {
  try {
    const users = await User.find()
      .select("-passwordHash")
      .sort({ fullName: 1 })
      .lean();
    if (!users || users.length === 0) {
      return res.status(404).json({ message: `No users found.` });
    }
    return res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
}

export async function getActiveUsers(req, res, next) {
  try {
    const users = await User.find({ isActive: true })
      .select("-passwordHash")
      .sort({ fullName: 1 })
      .lean();
    if (!users || users.length === 0) {
      return res.status(404).json({ message: `No active users found.` });
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
      roles,
    } = req.body;

    // Validate inputs
    if (
      typeof username !== "string" ||
      username.trim().length < USERNAME_MIN_LENGTH
    ) {
      return res.status(400).json({
        message: `Username must have at least ${USERNAME_MIN_LENGTH} characters.`,
      });
    }

    if (typeof fullName !== "string" || !fullName.trim()) {
      return res.status(400).json({ message: "Full name is required." });
    }

    if (typeof position !== "string" || !position.trim()) {
      return res.status(400).json({ message: "Position is required." });
    }

    if (typeof location !== "string" || !location.trim()) {
      return res.status(400).json({ message: "Location is required." });
    }

    // Validate email
    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ message: "Email is required." });
    }

    // Validate password
    if (typeof password !== "string" || password.length < PASSWORD_MIN_LENGTH) {
      return res.status(400).json({
        message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
      });
    }

    // A user is permitted to have zero roles (e.g. external supplier), empty array acceptable.
    if (roles && !Array.isArray(roles)) {
      return res.status(400).json({ message: "Roles must be an array." });
    }

    if (!department) {
      return res.status(400).json({ message: "Department is required." });
    }

    const departmentError = validateObjectIdArray(
      department,
      "Department",
      MINIMUM_DEPARTMENTS
    );
    if (departmentError)
      return res.status(400).json({ message: `${departmentError}` });

    const existingUsername = await User.findOne({
      username: username.toLowerCase().trim(),
    }).lean();
    if (existingUsername) {
      return res.status(400).json({ message: `Username already exists.` });
    }

    const newUser = await User.create({
      username: username.toLowerCase().trim(),
      fullName: fullName.trim(),
      location,
      department,
      email: email.toLowerCase().trim(),
      position: position.trim(),
      passwordHash: password,
      roles,
    });
    return res.status(200).json({
      message: `${username} successfully created.`,
      newId: newUser.id,
    });
  } catch (error) {
    next(error);
  }
}

export async function editUser(req, res, next) {
  try {
    const userId = req.params.id;

    // Validate inputs
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const { fullName, location, department, email, position, roles } = req.body;

    if (typeof fullName !== "string" || !fullName.trim()) {
      return res.status(400).json({ message: "Full name is required." });
    }

    if (typeof position !== "string" || !position.trim()) {
      return res.status(400).json({ message: "Position is required." });
    }

    if (typeof location !== "string" || !location.trim()) {
      return res.status(400).json({ message: "Location is required." });
    }

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ message: "Email is required." });
    }

    // A user is permitted to have zero roles (e.g. external supplier). Unit test this.
    if (roles && !Array.isArray(roles)) {
      return res.status(400).json({ message: "Roles must be an array." });
    }

    const departmentError = validateObjectIdArray(
      department,
      "Department",
      MINIMUM_DEPARTMENTS
    );
    if (departmentError) {
      return res.status(400).json({ message: `${departmentError}` });
    }

    const editUser = await User.findByIdAndUpdate(
      userId,
      {
        fullName: fullName.trim(),
        location: location.trim(),
        department,
        email: email.toLowerCase().trim(),
        position: position.trim(),
        roles,
        isActive: true,
      },
      { runValidators: true, new: true }
    );

    if (!editUser) {
      return res.status(400).json({ message: "User not found." });
    }

    return res
      .status(200)
      .json({ message: `${editUser.username} has been updated successfully.` });
  } catch (error) {
    next(error);
  }
}

export async function terminateUser(req, res, next) {
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

    // Confirm user is currently active.
    if (!user.isActive) {
      return res.status(400).json({ message: "User is already inactive." });
    }

    // Get all active access assignments for user
    const assignments = await ActiveAccessAssignment.find({ userId }).lean();

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

    return res.status(200).json({ message: "Processing complete.", results });
  } catch (error) {
    next(error);
  }
}
