import ActiveAccessAssignment from "../models/activeAccessAssignments.js";
import AccessRequest from "../models/accessRequests.js";
import SystemApplication from "../models/configSystemApplications.js";
import { isValidObjectId } from "../utils/validation.js";

export async function getAccessAssignments(req, res, next) {
  // Permission check
  const hasPermission = req.user.permissions.includes(
    "accessAssignmentsCanView"
  );
  const isSuperAdmin = req.user.isSuperAdmin;
  if (!hasPermission && !isSuperAdmin) {
    return res
      .status(403)
      .json({ message: `User has insufficient permissions.` });
  }

  // Single route accepts multiple filters
  try {
    // debugger;
    const { userId, applicationId } = req.query;

    const filter = {};

    if (isValidObjectId(userId)) filter.userId = userId;
    if (isValidObjectId(applicationId)) filter.applicationId = applicationId;

    const assignments = await ActiveAccessAssignment.find(filter)
      .populate("userId")
      .populate("completedBy")
      .populate("applicationId");

    // If assignments array is empty, do not send 404
    // if (assignments.length === 0) {
    //   return res.status(404).json({ message: "No access assignments found." });
    // }

    return res.status(200).json({ assignments });
  } catch (error) {
    next(error);
  }
}

export async function getAccessRequests(req, res, next) {
  // Permission check
  const hasPermission = req.user.permissions.includes("accessRequestsCanView");
  const isSuperAdmin = req.user.isSuperAdmin;
  if (!hasPermission && !isSuperAdmin) {
    return res
      .status(403)
      .json({ message: `User has insufficient permissions.` });
  }

  // Single route accepts multiple filters
  // Returns a record of all the *requests*
  try {
    // debugger;
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

    if (isValidObjectId(userId)) filter.userId = userId;
    if (requestType) filter.requestType = requestType;
    if (status) filter.status = status;
    if (isValidObjectId(applicationId)) filter.applicationId = applicationId;
    if (completedBy) filter.completedBy = completedBy;
    if (requestedBy) filter.requestedBy = requestedBy;

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
      .sort({ requestedAt: -1 });

    // If accessRequests.length === 0 continue to return empty array.
    // if (accessRequests.length === 0) {
    //   return res.status(404).json({ message: "No access requests found." });
    // }

    // debugger;
    return res.status(200).json({ accessRequests });
  } catch (error) {
    next(error);
  }
}

export async function newAccessRequest(req, res, next) {
  // Permission check
  const hasPermission = req.user.permissions.includes(
    "accessRequestsCanCreate"
  );
  const isSuperAdmin = req.user.isSuperAdmin;
  if (!hasPermission && !isSuperAdmin) {
    return res
      .status(403)
      .json({ message: `User has insufficient permissions.` });
  }
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

    // if (!isValidObjectId(requestedBy)) {
    //   return res
    //     .status(400)
    //     .json({ message: "requestedById is not a valid ObjectId." });
    // }

    // Validate front-end app Ids
    applicationId.forEach((app) => {
      if (!isValidObjectId(app)) {
        return res
          .status(400)
          .json({ message: "applicationId is not a valid ObjectId." });
      }
    });

    // Track results
    const results = {
      created: [],
      alreadyRequested: [],
      alreadyActive: [],
      errors: [],
    };

    for (const appId of applicationId) {
      try {
        // debugger;
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
    // debugger;
    return res.status(201).json({
      message: "Processing completed.",
      results,
    });
  } catch (error) {
    next(error);
  }
}

export async function approveOrRejectRequest(req, res, next) {
  // Permission check, note: there is a subsequent check that user is admin of system being changes
  const hasPermission = req.user.permissions.includes(
    "accessRequestsCanApproveReject"
  );
  const isSuperAdmin = req.user.isSuperAdmin;
  if (!hasPermission && !isSuperAdmin) {
    return res
      .status(403)
      .json({ message: `User has insufficient permissions.` });
  }

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
    // debugger;
    const requestDoc = await AccessRequest.findById(id);
    if (!requestDoc) {
      return res.status(404).json({ message: "Access request not found." });
    }
    const applicationId = requestDoc?.applicationId;
    if (!applicationId) {
      return res
        .status(400)
        .json({ message: "Request ID has invalid system id." });
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

    // debugger;
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

export async function revokeAccessRequest(req, res, next) {
  // Permission check
  const hasPermission = req.user.permissions.includes(
    "accessRequestsCanRevoke"
  );
  const isSuperAdmin = req.user.isSuperAdmin;
  if (!hasPermission && !isSuperAdmin) {
    return res
      .status(403)
      .json({ message: `User has insufficient permissions.` });
  }

  try {
    const { ids } = req.body;
    const requestedBy = req.user._id;
    // To do: does requestedBy have permission to terminate?

    const results = await processRevocations(ids, requestedBy);

    return res.status(201).json({
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
          results.errors.push(requestId);
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
          results.alreadyRequested.push(appId);
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
        results.errors.push({ appId, error: err.message });
      }
    }
    return results;
  } catch (error) {
    next(error);
  }
}
