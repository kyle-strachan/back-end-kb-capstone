import SystemApplication from "../models/configSystemApplications.js";
import SystemCategory from "../models/configSystemCategories.js";
import { isValidObjectId, validateObjectIdArray } from "../utils/validation.js";
import {
  MINIMUM_SYSTEM_LENGTH,
  MINIMUM_SYSTEM_ADMINS,
} from "../utils/constants.js";

export async function getSystemApplications(req, res, next) {
  try {
    const query = {};

    // Create optional isActive filter, config screen will show all,
    // drop down boxes will show only active.
    if (req.query.active === "true") {
      query.isActive = true;
    }

    const systemApplications = await SystemApplication.find(query)
      .sort({
        system: 1,
      })
      .lean();
    const systemCategories = await SystemCategory.find()
      .sort({ category: 1 })
      .lean();

    // Reject if either are incomplete or empty
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

    if (typeof system !== "string") {
      return res.status(400).json({ message: "Invalid system name." });
    }

    const trimmedSystem = system?.trim();

    // Validate inputs
    if (!trimmedSystem || trimmedSystem.length < MINIMUM_SYSTEM_LENGTH) {
      return res.status(400).json({
        message: `A new system must have at least ${MINIMUM_SYSTEM_LENGTH} characters.`,
      });
    }

    // Description may be blank
    const trimmedDescription = description?.trim();

    if (!isValidObjectId(category)) {
      return res.status(400).json({ message: "Category ID is invalid." });
    }

    // Check that all admins are valid
    const adminUserError = validateObjectIdArray(
      adminUser,
      "AdminUser",
      MINIMUM_SYSTEM_ADMINS
    );

    if (adminUserError) {
      return res.status(400).json({ message: `${adminUserError}` });
    }

    // Insert new system
    await SystemApplication.create({
      system: trimmedSystem,
      category,
      ...(isActive !== undefined && {
        isActive: Boolean(
          isActive === true || isActive === "true" // Ensure isActive is true boolean
        ),
      }),
      adminUser,
      sendEmail: Boolean(sendEmail === true || sendEmail === "true"),
      description: trimmedDescription,
    });
    return res
      .status(201)
      .json({ message: `${trimmedSystem} created successfully.` });
  } catch (error) {
    next(error);
  }
}

export async function editSystemApplication(req, res, next) {
  try {
    const { system, category, isActive, adminUser, sendEmail, description } =
      req.body;

    if (typeof system !== "string") {
      return res.status(400).json({ message: "Invalid system name." });
    }

    const trimmedSystem = system?.trim();

    // Validate inputs
    if (!trimmedSystem || trimmedSystem.length < MINIMUM_SYSTEM_LENGTH) {
      return res.status(400).json({
        message: `System name must have at least ${MINIMUM_SYSTEM_LENGTH} characters.`,
      });
    }

    // Description may be blank
    const trimmedDescription = description?.trim();

    if (!isValidObjectId(category)) {
      return res.status(400).json({ message: "Category ID is invalid." });
    }

    // Check that all admins are valid
    const adminUserError = validateObjectIdArray(
      adminUser,
      "AdminUser",
      MINIMUM_SYSTEM_ADMINS
    );

    if (adminUserError) {
      return res.status(400).json({ message: `${adminUserError}` });
    }

    const modifiedSystem = await SystemApplication.findByIdAndUpdate(
      req.params.id,
      {
        system: trimmedSystem,
        category,
        ...(isActive !== undefined && {
          isActive: Boolean(
            isActive === true || isActive === "true" // Ensure isActive is true boolean
          ),
        }),
        adminUser,
        ...(sendEmail !== undefined && {
          sendEmail: Boolean(
            sendEmail === true || sendEmail === "true" // Ensure sendEmail is true boolean
          ),
        }),
        description: trimmedDescription,
      },
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
