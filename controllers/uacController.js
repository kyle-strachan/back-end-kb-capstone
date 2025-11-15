import ActiveAccessAssignment from "../models/activeAccessAssignments.js";
import AccessRequest from "../models/accessRequests.js";
import SystemApplication from "../models/configSystemApplications.js";
import { isValidObjectId } from "../utils/validation.js";

export async function getActiveAccessAssignments(req, res, next) {
  // Single route accepts multiple filters
  try {
    const { userId, applicationId } = req.query;

    const filter = {};

    if (isValidObjectId(userId)) filter.userId = userId;
    if (isValidObjectId(applicationId)) filter.applicationId = applicationId;

    const assignments = await ActiveAccessAssignment.find(filter)
      .populate("userId")
      .populate("completedBy")
      .populate("applicationId");

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
  // debugger;
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
        // Check for existing request
        const existingRequest = await AccessRequest.findOne({
          userId,
          applicationId: appId,
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
  try {
    const { id, action } = req.body;
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
    const requestDoc = await AccessRequest.findById(id).select("applicationId");
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
    const admins = systemDoc?.adminUser;
    if (!admins) {
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

    const response = await AccessRequest.findByIdAndUpdate(
      id,
      {
        status: action,
        completedBy,
        updatedAt: new Date().toISOString(),
      },
      { new: true }
    );

    if (!response) {
      return res.status(400).json({
        message: "Unable to process request.",
      });
    }

    // LOGIC FOR CREATING ACTIVE REQUEST GOES HERE.

    return res.status(200).json({
      message: "Access request updated successfully.",
    });
  } catch (error) {
    next(error);
  }
}

// export async function updateAccessRequest(req, res, next) {
//   try {
//     const { userId, applicationId, status, notes } = req.body;

//     // Validate request
//     if (!isValidObjectId(userId)) {
//       return res
//         .status(400)
//         .json({ message: "userId is not a valid ObjectId." });
//     }

//     if (!isValidObjectId(applicationId)) {
//       return res
//         .status(400)
//         .json({ message: "applicationId is not a valid ObjectId." });
//     }

//     if (!isValidObjectId(approvedBy)) {
//       return res
//         .status(400)
//         .json({ message: "approvedBy is not a valid ObjectId." });
//     }

//     const validStatus = ["Approved", "Denied", "Withdrawn", "Revoked"];
//     if (!validStatus.includes(status)) {
//       return res.status(400).json({ message: "Invalid new status provided." });
//     }

//     const trimmedNotes = typeof notes === "string" ? notes.trim() : null;

//     // Verify user making update to request is an admin of the application being changed
//     const isApproverAdminOfSystem = await SystemApplication.findOne({
//       _id: applicationId,
//       adminUser: approvedBy,
//     });
//     if (!isApproverAdminOfSystem) {
//       return res.status(403).json({
//         message:
//           "approvedBy user is not an admin of the application system and may not make changes.",
//       });
//     }

//     debugger;
//     // Only allow updates of open/"new" status requests.
//     const updatedRequest = await AccessRequest.findOneAndUpdate(
//       { _id: req.params.id, status: "New" },
//       { status, approvedBy },
//       { runValidators: true, new: true }
//     );

//     if (!updatedRequest) {
//       return res.status(404).json({
//         message: `No open/"new" status access request found to update.`,
//       });
//     }

//     // Remove any assignment if request update is revoke
//     if (status === "Revoked") {
//       await ActiveAccessAssignment.deleteMany({
//         userId,
//         applicationId,
//       });
//     }

//     // Add assignment if request update is approved
//     if (status === "Approved") {
//       const existing = await ActiveAccessAssignment.exists({
//         userId,
//         applicationId,
//       });
//       if (existing) {
//         return res.status(400).json({
//           message: `User already has access to this application.`,
//         });
//       } else {
//         await ActiveAccessAssignment.create({
//           userId,
//           applicationId,
//           completedBy: approvedBy,
//           notes: trimmedNotes,
//         });
//       }
//     }

//     return res
//       .status(200)
//       .json({ message: "Access request successfully updated." });
//   } catch (error) {
//     next(error);
//   }
// }
