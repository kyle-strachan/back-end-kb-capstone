import Doc from "../models/docs.js";
import { isValidObjectId } from "../utils/validation.js";

// TO DO: USER FIELD AND AT FIELDS MUST BE POPULATED

// Permission check, note: there is a subsequent check that user is admin of system being changes
// const hasPermission = req.user.permissions.includes(
//   "accessRequestsCanApproveReject"
// );
// const isSuperAdmin = req.user.isSuperAdmin;
// if (!hasPermission && !isSuperAdmin) {
//   return res
//     .status(403)
//     .json({ message: `User has insufficient permissions.` });
// }

export async function getDocs(req, res, next) {
  // Permission check
  // const hasPermission = req.user.permissions.includes("systemsCanManage");
  // const isSuperAdmin = req.user.isSuperAdmin;
  // if (!hasPermission && !isSuperAdmin) {
  //   return res
  //     .status(403)
  //     .json({ message: `User has insufficient permissions.` });
  // }
  try {
    const docs = await Doc.find().sort({ name: 1 });
    if (docs.length === 0) {
      return res.status(404).json({ message: `No documents found.` });
    }
    return res.status(200).json(docs);
  } catch (error) {
    next(error);
  }
}

export async function getDoc(req, res, next) {
  // Permission check
  // const hasPermission = req.user.permissions.includes("systemsCanManage");
  // const isSuperAdmin = req.user.isSuperAdmin;
  // if (!hasPermission && !isSuperAdmin) {
  //   return res
  //     .status(403)
  //     .json({ message: `User has insufficient permissions.` });
  // }

  debugger;

  try {
    const docId = req.params.id;
    const doc = await Doc.findById(docId)
      .populate("createdBy")
      .populate("department")
      .populate("docsCategory");
    if (!doc) {
      return res.status(404).json({ message: `Document not found.` });
    }
    return res.status(200).json({ doc });
  } catch (error) {
    next(error);
  }
}

export async function newDoc(req, res, next) {
  // Permission check
  const hasPermission = req.user.permissions.includes("docsCanCreate");
  const isSuperAdmin = req.user.isSuperAdmin;
  if (!hasPermission && !isSuperAdmin) {
    return res
      .status(403)
      .json({ message: `User has insufficient permissions.` });
  }

  const lastModifiedByUser = req.user.id;

  try {
    const { title, description, body, department, isPublic, docsCategory } =
      req.body;

    // Validate inputs
    if (!title || title.length < 3) {
      return res
        .status(400)
        .json({ message: `A title must have at least three characters.` });
    }

    if (!description || description.length < 3) {
      return res.status(400).json({
        message: `A description must have at least three characters.`,
      });
    }

    if (!body || body.length < 3) {
      return res.status(400).json({
        message: `A document body must have at least three characters.`,
      });
    }

    const departmentError = isValidObjectId(department);
    if (!departmentError) {
      return res.status(400).json({ message: `Department ID is invalid.` });
    }

    const docsCategoryError = isValidObjectId(docsCategory);
    if (!docsCategoryError) {
      return res
        .status(400)
        .json({ message: `Document category ID is invalid.` });
    }

    const doc = await Doc.create({
      title,
      description,
      body,
      createdBy: lastModifiedByUser,
      lastModifiedBy: lastModifiedByUser,
      lastModifiedAt: new Date(), // model requires this
      department,
      isPublic,
      docsCategory: docsCategory,
    });

    console.log(doc.id, doc._id);

    if (!doc) {
      return res
        .status(400)
        .json({ message: `Document could not be created.` });
    }

    return res
      .status(201)
      .json({ message: "Document created successfully.", docId: doc._id });
  } catch (error) {
    next(error);
  }
}

export async function editDoc(req, res, next) {
  // Permission check
  // const hasPermission = req.user.permissions.includes("systemsCanManage");
  // const isSuperAdmin = req.user.isSuperAdmin;
  // if (!hasPermission && !isSuperAdmin) {
  //   return res
  //     .status(403)
  //     .json({ message: `User has insufficient permissions.` });
  // }
  try {
    const {
      title,
      description,
      body,
      lastModifiedBy,
      department,
      isDepartmentOnly,
      docsCategory,
      associatedSystem,
    } = req.body;

    const docId = req.params.id;
    const updatedDoc = await Doc.findByIdAndUpdate(
      docId,
      {
        title,
        description,
        body,
        lastModifiedBy,
        department,
        isDepartmentOnly,
        docsCategory,
        associatedSystem,
      },
      { runValidators: true, new: true }
    );
    if (!updatedDoc) {
      return res
        .status(404)
        .json({ message: `${docId} could not be updated.` });
    }
    return res
      .status(200)
      .json({ message: `Document successfully created.` }, updatedDoc);
  } catch (error) {
    next(error);
  }
}

export function toggleArchiveDoc(archive) {
  // Permission check
  // const hasPermission = req.user.permissions.includes("systemsCanManage");
  // const isSuperAdmin = req.user.isSuperAdmin;
  // if (!hasPermission && !isSuperAdmin) {
  //   return res
  //     .status(403)
  //     .json({ message: `User has insufficient permissions.` });
  // }
  return async (req, res, next) => {
    try {
      const docId = req.params.id;

      const updated = await Doc.findByIdAndUpdate(
        docId,
        { isArchived: archive },
        { new: true }
      );

      if (!updated) {
        return res
          .status(404)
          .json({ message: `Document ${docId} not found.` });
      }

      res.status(200).json({
        message: `Document ${
          archive ? "archived" : "unarchived"
        } successfully.`,
        doc: updated,
      });
    } catch (error) {
      next(error);
    }
  };
}
