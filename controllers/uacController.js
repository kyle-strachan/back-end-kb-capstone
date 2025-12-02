import ActiveAccessAssignment from "../models/activeAccessAssignments.js";
import AccessRequest from "../models/accessRequests.js";
import SystemApplication from "../models/configSystemApplications.js";
import { isValidObjectId } from "../utils/validation.js";
import User from "../models/users.js";

export async function getAccessAssignments(req, res, next) {
  // Single route accepts multiple filters
  try {
    const { userId, applicationId } = req.query;

    const filter = {};

    // Validate inputs
    if (typeof userId === "string" && isValidObjectId(userId)) {
      filter.userId = userId;
    }
    if (typeof applicationId === "string" && isValidObjectId(applicationId)) {
      filter.applicationId = applicationId;
    }

    const assignments = await ActiveAccessAssignment.find(filter)
      .populate("userId")
      .populate("completedBy")
      .populate("applicationId")
      .lean();

    // Continue to return empty array if no assignment are found

    return res.status(200).json({ assignments });
  } catch (error) {
    next(error);
  }
}

export async function getAccessRequests(req, res, next) {
  // Returns a record of all the *requests*
  // Single route accepts multiple filters
  try {
    // Read query parameters of all possible filters
    const {
      userId,
      requestType,
      requestedBy,
      requestedAfter,
      requestedBefore,
      applicationId,
      status,
      completedBy,
    } = req.query;

    const filter = {};

    if (requestType) filter.requestType = requestType;
    if (status) filter.status = status;

    // Validate inputs
    if (typeof userId === "string" && isValidObjectId(userId)) {
      filter.userId = userId;
    }
    if (typeof applicationId === "string" && isValidObjectId(applicationId)) {
      filter.applicationId = applicationId;
    }
    if (typeof completedBy === "string" && isValidObjectId(completedBy)) {
      filter.completedBy = completedBy;
    }
    if (typeof requestedBy === "string" && isValidObjectId(requestedBy)) {
      filter.requestedBy = requestedBy;
    }

    // Optional date filtering
    if (requestedAfter || requestedBefore) {
      filter.requestedAt = {};
      if (requestedAfter) filter.requestedAt.$gte = new Date(requestedAfter);
      if (requestedBefore) filter.requestedAt.$lte = new Date(requestedBefore);
    }

    const accessRequests = await AccessRequest.find(filter)
      .populate("userId", "fullName username position")
      .populate("requestedBy", "fullName username position")
      .populate("completedBy", "fullName username position")
      .populate("applicationId", "system")
      .sort({ requestedAt: -1 })
      .lean();

    // Continue to return empty array if no requests are found

    return res.status(200).json({ accessRequests });
  } catch (error) {
    next(error);
  }
}

export async function newAccessRequest(req, res, next) {
  try {
    const { userId, applicationId, requestNote } = req.body;
    const requestedBy = req.user._id;

    const trimmedRequestedNote =
      typeof requestNote === "string" ? requestNote.trim() : null;

    // Validate front-end inputs
    if (!isValidObjectId(userId)) {
      return res
        .status(400)
        .json({ message: "userId is not a valid ObjectId." });
    }

    // Validate front-end app Ids, confirm applicationId is array of ObjectIds
    if (!Array.isArray(applicationId) || applicationId.length === 0) {
      return res
        .status(400)
        .json({ message: "applicationId must be a non-empty array." });
    }

    for (const app of applicationId) {
      if (typeof app !== "string" || !isValidObjectId(app)) {
        return res
          .status(400)
          .json({ message: "applicationId contains an invalid ObjectId." });
      }
    }

    // Confirm user is active and exists
    const userExists = await User.findOne({ _id: userId, isActive: true });
    if (!userExists) {
      return res
        .status(404)
        .json({ message: "User does not exists or is no longer active." });
    }

    // Track results
    const results = {
      created: [],
      alreadyRequested: [],
      alreadyActive: [],
      errors: [],
    };

    for (const appId of applicationId) {
      try {
        // Check for existing/duplicate request. OK to have existing Rejected/Terminated requested. Approved request will be caught in existing access.
        const existingRequest = await AccessRequest.findOne({
          userId,
          applicationId: appId,
          status: "New",
        });

        if (existingRequest) {
          results.alreadyRequested.push(appId);
          continue;
        }

        // Check existing access
        const existingAccess = await ActiveAccessAssignment.findOne({
          userId,
          applicationId: appId,
        });

        if (existingAccess) {
          results.alreadyActive.push(appId);
          continue;
        }

        // Create the new request
        const newReq = await AccessRequest.create({
          userId,
          requestType: "Activate",
          requestedBy,
          applicationId: appId,
          requestNote: trimmedRequestedNote,
          status: "New",
        });

        results.created.push(newReq);
      } catch (err) {
        results.errors.push({ appId, error: err.message });
      }
    }

    return res.status(201).json({
      message: "Processing completed.",
      results,
    });
  } catch (error) {
    next(error);
  }
}

export async function approveOrRejectRequest(req, res, next) {
  try {
    const id = req.params.id;
    const { action } = req.body;
    const completedBy = req.user._id;

    // Validate id of request to action is of correct form
    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json({ message: "id of access request is not a valid ObjectId." });
    }

    // Validate action type
    if (action !== "Approved" && action !== "Rejected") {
      return res.status(400).json({ message: "Action type is not valid." });
    }

    // Get system id
    const requestDoc = await AccessRequest.findById(id);
    if (!requestDoc) {
      return res.status(404).json({ message: "Access request not found." });
    }

    const applicationId = requestDoc?.applicationId;

    // Extra validation, in case application is deleted with pre-existing request
    if (!isValidObjectId(applicationId)) {
      return res.status(400).json({ message: "applicationId is invalid." });
    }

    // Confirm request can still be actioned.
    if (requestDoc.status !== "New") {
      return res.status(400).json({ message: "Request is already processed." });
    }

    // Get admins of system
    const systemDoc = await SystemApplication.findById(applicationId).select(
      "adminUser"
    );
    if (!systemDoc) {
      return res.status(404).json({ message: "System application not found." });
    }
    const admins = systemDoc.adminUser;
    if (!admins || admins.length === 0) {
      return res
        .status(400)
        .json({ message: "No admin users are configured." });
    }

    // Confirm user is an admin of the system in question from database.
    const isAdmin = admins.some((a) => a.toString() === completedBy.toString());
    if (!isAdmin) {
      return res.status(403).json({
        message:
          "User is not an admin of the application system and may not approve or deny access requests.",
      });
    }

    // Add assignment if request update is approved
    if (action === "Approved") {
      // Check if user already has active assignment
      const existing = await ActiveAccessAssignment.exists({
        userId: requestDoc.userId,
        applicationId: requestDoc.applicationId,
      });
      if (existing) {
        return res.status(400).json({
          message: `User already has access to this application.`,
        });
      } else {
        // Insert new active assignment.
        await ActiveAccessAssignment.create({
          userId: requestDoc.userId,
          applicationId: requestDoc.applicationId,
          completedBy,
          notes: requestDoc.notes,
          sourceRequestId: id,
        });
      }
    }

    // Update request
    const response = await AccessRequest.findByIdAndUpdate(
      id,
      {
        status: action,
        completedBy,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!response) {
      return res.status(400).json({
        message: "Unable to process request.",
      });
    }

    return res.status(200).json({
      message: "Access request updated successfully.",
    });
  } catch (error) {
    next(error);
  }
}

export async function createRevokeAccessRequest(req, res, next) {
  try {
    const { ids } = req.body;
    const requestedBy = req.user._id;

    // Validate ids array
    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid request array received." });
    }

    for (const id of ids) {
      if (typeof id !== "string" || !isValidObjectId(id)) {
        return res
          .status(400)
          .json({ message: "Request contains an invalid ObjectId." });
      }
    }

    const results = await processRevocations(ids, requestedBy);

    return res.status(200).json({
      message: "Processing completed.",
      results,
    });
  } catch (error) {
    next(error);
  }
}

export async function processRevocations(ids, requestedBy) {
  try {
    // Track results
    const results = {
      created: [],
      alreadyRequested: [],
      noAccess: [],
      errors: [],
    };

    for (const requestId of ids) {
      try {
        // Validate front end ID
        if (!isValidObjectId(requestId)) {
          results.errors.push({ requestId, error: "Invalid ObjectId." });
          continue;
        }

        // Check existing access
        const existingAccess = await ActiveAccessAssignment.findOne({
          _id: requestId,
        });

        // Reject request if user does not have access to this application
        if (!existingAccess) {
          results.noAccess.push(requestId);
          continue;
        }

        // Check for existing "New" Revoke request for userId/applicationId combination
        const existingRequest = await AccessRequest.findOne({
          userId: existingAccess.userId,
          applicationId: existingAccess.applicationId,
          status: "New",
        });

        if (existingRequest) {
          results.alreadyRequested.push(requestId);
          continue;
        }

        // Create the new request
        const newReq = await AccessRequest.create({
          userId: existingAccess.userId,
          requestType: "Revoke",
          requestedBy,
          applicationId: existingAccess.applicationId,
          status: "New",
        });

        // Mark access assignment as pending revocation
        const updateRevoke = await ActiveAccessAssignment.findByIdAndUpdate(
          requestId,
          { pendingRevocation: true }
        );

        results.created.push(newReq);
      } catch (err) {
        results.errors.push({ requestId, error: err.message });
      }
    }
    return results;
  } catch (error) {
    return res.status(500).json({ message: "Unknown error occurred." });
  }
}

export async function getToActionAccessRequests(req, res, next) {
  // Display requests that user can action
  try {
    const adminSystems = await SystemApplication.find({
      adminUser: req.user._id,
    })
      .select("_id")
      .lean();

    const systemIds = adminSystems.map((s) => s._id);

    // If a user is not an admin of any system, return zero requests
    if (!Array.isArray(systemIds) || systemIds.length === 0) {
      return res.status(200).json({
        toActionRequests: [],
        counts: { activate: 0, revoke: 0 },
      });
    }

    const toActionRequests = await AccessRequest.find({
      applicationId: { $in: systemIds },
      status: "New",
    })
      .populate("userId", "fullName username position")
      .populate("requestedBy", "fullName username position")
      .populate("completedBy", "fullName username position")
      .populate("applicationId", "system")
      .sort({ requestedAt: -1 })
      .lean();

    // Count for front-end badges. Perfoming on back-end for not on every re-render on front-end.
    const toActivateTotal = toActionRequests.filter(
      (req) => req.requestType === "Activate"
    ).length;

    const toRevokeTotal = toActionRequests.filter(
      (req) => req.requestType === "Revoke"
    ).length;

    return res.status(200).json({
      toActionRequests,
      counts: {
        activate: toActivateTotal,
        revoke: toRevokeTotal,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function confirmRevocation(req, res, next) {
  try {
    // Confirm pending revocation exists
    if (!isValidObjectId(req.params.id)) {
      return res
        .status(400)
        .json({ message: "Invalid revocation request ID." });
    }

    const accessRequest = await AccessRequest.findById(req.params.id);

    if (!accessRequest) {
      return res
        .status(400)
        .json({ message: "Revocation request could not be found." });
    }

    // Get admins of system
    const systemDoc = await SystemApplication.findById(
      accessRequest.applicationId
    ).select("adminUser");
    if (!systemDoc) {
      return res.status(404).json({ message: "System application not found." });
    }
    const admins = systemDoc.adminUser;
    if (!admins || admins.length === 0) {
      return res
        .status(400)
        .json({ message: "No admin users are configured." });
    }

    // Confirm user is an admin of the system in question from database.
    const isAdmin = admins.some(
      (a) => a.toString() === req.user._id.toString()
    );
    if (!isAdmin) {
      return res.status(403).json({
        message:
          "User is not an admin of the application system and may not confirm revocation.",
      });
    }

    // Confirm user still has access to system in question and delete
    const deleteAccess = await ActiveAccessAssignment.deleteMany({
      applicationId: accessRequest.applicationId,
      userId: accessRequest.userId,
    }); // Deletes any duplicates that might exist

    // Close request ticket
    accessRequest.status = "Revoked";
    accessRequest.completedBy = req.user._id;
    accessRequest.updatedAt = new Date();
    await accessRequest.save();

    return res.status(200).json({ message: "Access revocation confirmed." });
  } catch (error) {
    next(error);
  }
}
