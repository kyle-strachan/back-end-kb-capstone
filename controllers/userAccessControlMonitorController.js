import ActiveAccessAssignment from "../models/activeAccessAssignments.js";
import AccessRequest from "../models/accessRequests.js";
import SystemApplication from "../models/configSystemApplications.js";
import { isValidObjectId, validateObjectIdArray } from "../utils/validation.js";

export async function getAccessAssignments(req, res, next) {
  // Single route accepts multiple filters
  try {
    const {
      userId,
      requestType,
      requestedAfter,
      requestedBefore,
      status,
      applicationId,
    } = req.query;

    const filter = {};

    if (isValidObjectId(userId)) filter.userId = userId;
    if (requestType) filter.requestType = requestType;
    if (status) filter.status = status;
    if (isValidObjectId(applicationId)) filter.applicationId = applicationId;
    if (requestedAfter || requestedBefore) {
      filter.requestedAt = {};
      if (requestedAfter) filter.requestedAt.$gte = new Date(requestedAfter);
      if (requestedBefore) filter.requestedAt.$lte = new Date(requestedBefore);
    }

    const assignments = await ActiveAccessAssignment.find(filter)
      .populate("userId")
      .populate("requestedBy")
      .populate("applicationId")
      .sort({ requestedAt: -1 });

    if (assignments.length === 0) {
      return res.status(404).json({ message: "No access assignments found." });
    }

    return res.status(200).json(assignments);
  } catch (error) {
    next(error);
  }
}

export async function getAccessRequests(req, res, next) {
  // Single route accepts multiple filters
  // Returns a record of all the *requests*
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
      approvedBy,
    } = req.query;

    const filter = {};

    if (isValidObjectId(userId)) filter.userId = userId;
    if (requestType) filter.requestType = requestType;
    if (status) filter.status = status;
    if (isValidObjectId(applicationId)) filter.applicationId = applicationId;
    if (approvedBy) filter.approvedBy = approvedBy;
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
      .populate("approvedBy", "fullName username position")
      .populate("applicationId", "name")
      .sort({ requestedAt: -1 });

    if (accessRequests.length === 0) {
      return res.status(404).json({ message: "No access requests found." });
    }

    return res.status(200).json(accessRequests);
  } catch (error) {
    next(error);
  }
}

export async function newAccessRequest(req, res, next) {
  try {
    const { userId, requestType, requestedBy, applicationId, requestNote } =
      req.body;

    const trimmedRequestedNote = requestNote ? requestNote.trim() : null;

    if (!isValidObjectId(userId)) {
      return res
        .status(400)
        .json({ message: "userId is not a valid ObjectId." });
    }

    if (requestType !== "Activate" && requestType !== "Revoke") {
      return res.status(400).json({ message: "requestType is invalid." });
    }

    if (!isValidObjectId(requestedBy)) {
      return res
        .status(400)
        .json({ message: "requestedById is not a valid ObjectId." });
    }

    if (!isValidObjectId(applicationId)) {
      return res
        .status(400)
        .json({ message: "applicationId is not a valid ObjectId." });
    }

    await AccessRequest.create({
      userId,
      requestType,
      requestedBy,
      applicationId,
      requestNote: trimmedRequestedNote,
      status: "New",
    });

    return res
      .status(201)
      .json({ message: "Access request submitted successfully." });
  } catch (error) {
    next(error);
  }
}

export async function updateAccessRequest(req, res, next) {
  try {
    const { userId, applicationId, approvedBy, status, notes, changeReason } =
      req.body;

    // Validate request
    if (!isValidObjectId(userId)) {
      return res
        .status(400)
        .json({ message: "userId is not a valid ObjectId." });
    }

    if (!isValidObjectId(applicationId)) {
      return res
        .status(400)
        .json({ message: "applicationId is not a valid ObjectId." });
    }

    if (!isValidObjectId(approvedBy)) {
      return res
        .status(400)
        .json({ message: "approvedBy is not a valid ObjectId." });
    }

    const validStatus = ["Approved", "Denied", "Withdrawn", "Revoked"];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid new status provided." });
    }

    // Verify user making update to request is an admin of the application being changed
    const isApproverAdminOfSystem = await SystemApplication.findOne({
      _id: applicationId,
      adminUser: approvedBy,
    });
    if (!isApproverAdminOfSystem) {
      return res.status(403).json({
        message:
          "approvedBy user is not an admin of the application system and may not make changes.",
      });
    }

    // Only allow updates of open/"new" status requests.
    const updatedRequest = await AccessRequest.findOneAndUpdate(
      { _id: req.params.id, status: "New" },
      { status, approvedBy },
      { runValidators: true, new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({
        message: `No open/"new" status access request found to update.`,
      });
    }

    if (status === "Approved" || status === "Revoked") {
      await insertAccessAssignment(
        userId,
        applicationId,
        approvedBy,
        status,
        notes,
        changeReason
      );
    }

    return res
      .status(200)
      .json({ message: "Access request successfully updated." });
  } catch (error) {
    next(error);
  }
}

// Insert record for active or revoked, per system, per user
async function insertAccessAssignment(
  userId,
  applicationId,
  completedBy,
  status,
  notes = null,
  changeReason = null
) {
  // userId, applicationId, status, completedBy already validated
  const trimmedNotes = notes ? notes.trim() : null;
  const trimmedChangeReason = changeReason ? changeReason.trim() : null;
  return ActiveAccessAssignment.create({
    userId,
    applicationId,
    status,
    completedBy,
    notes: trimmedNotes,
    changeReason: trimmedChangeReason,
  });
}
