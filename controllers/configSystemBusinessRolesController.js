import BusinessRole from "../models/configBusinessRoles.js";
import { validateObjectIdArray } from "../utils/validation.js";

export async function getBusinessRoles(req, res, next) {
  try {
    const businessRoles = await BusinessRole.find().sort({ roleName: 1 });
    if (!businessRoles || businessRoles.length === 0) {
      return res.status(404).json({ message: `No business roles found.` });
    }
    return res.status(200).json(businessRoles);
  } catch (error) {
    next(error);
  }
}

export async function newBusinessRole(req, res, next) {
  try {
    const { roleName, defaultAccessRequests, description } = req.body;

    if (!roleName || !roleName.trim()) {
      return res
        .status(400)
        .json({ message: "Business role name is required." });
    }

    const minimumDefaultAccessRequests = 0;
    const defaultAccessRequestsError = validateObjectIdArray(
      defaultAccessRequests,
      "DefaultAccessRequest",
      minimumDefaultAccessRequests
    );
    if (defaultAccessRequestsError) {
      return res.status(400).json({ message: `${defaultAccessRequestsError}` });
    }

    await BusinessRole.create({
      roleName,
      defaultAccessRequests,
      isActive: true,
      description,
    });
    return res
      .status(201)
      .json({ message: `${roleName} successfully created.` });
  } catch (error) {
    next(error);
  }
}

export async function editBusinessRole(req, res, next) {
  try {
    const { roleName, defaultAccessRequests, isActive, description } = req.body;

    if (!roleName || !roleName.trim()) {
      return res
        .status(400)
        .json({ message: "Business role name is required." });
    }

    const minimumDefaultAccessRequests = 0;
    const defaultAccessRequestsError = validateObjectIdArray(
      defaultAccessRequests,
      "DefaultAccessRequest",
      minimumDefaultAccessRequests
    );
    if (defaultAccessRequestsError) {
      return res.status(400).json({ message: `${defaultAccessRequestsError}` });
    }

    const updatedRole = await BusinessRole.findByIdAndUpdate(
      req.params.id,
      {
        roleName,
        defaultAccessRequests,
        isActive,
        description,
      },
      { new: true, runValidators: true }
    );

    if (!updatedRole) {
      return res.status(404).json({ message: "Business role not found." });
    }
    return res
      .status(200)
      .json({ message: `${updatedRole.roleName} successfully updated.` });
  } catch (error) {
    next(error);
  }
}
