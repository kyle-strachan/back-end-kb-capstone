import SystemApplication from "../models/configSystemApplications.js";
import SystemCategory from "../models/configSystemCategories.js";
import { isValidObjectId, validateObjectIdArray } from "../utils/validation.js";

export async function getSystemApplications(req, res, next) {
  try {
    const query = {};

    if (req.query.active === "true") {
      query.isActive = true;
    }

    const systemApplications = await SystemApplication.find(query).sort({
      system: 1,
    });
    const systemCategories = await SystemCategory.find().sort({ name: 1 });
    // Reject if either are incomplete or empty.
    if (
      !systemApplications ||
      systemApplications.length === 0 ||
      !systemCategories ||
      systemCategories.length === 0
    ) {
      return res
        .status(404)
        .json({ message: `No applications and/or categories found.` });
    }
    return res.status(200).json({ systemApplications, systemCategories });
  } catch (error) {
    next(error);
  }
}

export async function newSystemApplication(req, res, next) {
  try {
    const { system, category, isActive, adminUser, sendEmail, description } =
      req.body;

    if (!system || !system.trim()) {
      return res.status(400).json({ message: "Application name is required." });
    }

    if (!isValidObjectId(category)) {
      return res.status(400).json({ message: "Category is required." });
    }

    const minimumAdminUser = 0;
    const adminUserError = validateObjectIdArray(
      adminUser,
      "AdminUser",
      minimumAdminUser
    );
    if (adminUserError) {
      return res.status(400).json({ message: `${adminUserError}` });
    }

    await SystemApplication.create({
      system,
      category,
      isActive,
      adminUser,
      sendEmail,
      description,
    });
    return res.status(201).json({ message: `${system} successfully created.` });
  } catch (error) {
    next(error);
  }
}

export async function editSystemApplication(req, res, next) {
  try {
    const { system, category, isActive, adminUser, sendEmail, description } =
      req.body;

    if (!system || !system.trim()) {
      return res.status(400).json({ message: "Application name is required." });
    }

    if (!isValidObjectId(category)) {
      return res
        .status(400)
        .json({ message: "Valid Category ID is required." });
    }

    const minimumAdminUser = 0;
    const adminUserError = validateObjectIdArray(
      adminUser,
      "AdminUser",
      minimumAdminUser
    );
    if (adminUserError) {
      return res.status(400).json({ message: `${adminUserError}` });
    }

    const modifiedSystem = await SystemApplication.findByIdAndUpdate(
      req.params.id,
      { system, category, isActive, adminUser, sendEmail, description },
      { runValidators: true, new: true }
    );

    if (!modifiedSystem) {
      return res.status(404).json({ message: "System application not found." });
    }

    return res
      .status(200)
      .json({ message: `${modifiedSystem.name} successfully updated.` });
  } catch (error) {
    next(error);
  }
}
