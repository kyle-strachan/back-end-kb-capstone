import Doc from "../models/docs.js";

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

  try {
    const docId = req.params.id;
    const doc = await Doc.findById(docId);
    if (!doc) {
      return res.status(404).json({ message: `Document not found.` });
    }
    return res.status(200).json(doc);
  } catch (error) {
    next(error);
  }
}

export async function newDoc(req, res, next) {
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
      departmentCategory,
      associatedSystem,
    } = req.body;

    const doc = await Doc.create(
      {
        title,
        description,
        body,
        lastModifiedBy,
        department,
        isDepartmentOnly,
        departmentCategory,
        associatedSystem,
      },
      { new: true }
    );

    if (!doc) {
      return res
        .status(400)
        .json({ message: `Document could not be created.` });
    }

    return res.status(201).json({ message: "Document created successfully." });
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
      departmentCategory,
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
        departmentCategory,
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

export async function getDocsCategories(req, res, next) {
  // No permission check required, populates non-sensitive drop down boxes

  try {
    const { user } = req;
    // const { permissions, department } = req.user;
    let filter = {};

    const permissionNames = user.permissions.map((p) => p.permissionName);
    const canViewAll = permissionNames.includes(
      "configCanViewAllDepartmentCategories"
    );
    const canViewOwn = permissionNames.includes(
      "configCanViewOwnDepartmentCategories"
    );
    const isSuperAdmin = permissionNames.includes("isSuperAdmin");

    if (canViewAll || isSuperAdmin) {
      filter = {}; // no filter required
    } else if (
      canViewOwn &&
      Array.isArray(user.department) &&
      user.department.length > 0
    ) {
      filter = { departmentId: { $in: user.department } }; // limit to user's own department
    } else {
      return res.status(403).json({ message: "Access denied." });
    }

    // debugger;
    const categories = await DepartmentCategory.find(filter)
      .populate("departmentId", "name")
      .sort({ categoryName: 1 });

    // console.log(categories);
    return res.status(200).json({ categories });
  } catch (error) {
    next(error);
  }
}

export async function newDocsCategory(req, res, next) {
  // Permission check
  const hasPermission = req.user.permissions.includes(
    "docsCategoriesCanManage"
  );
  const isSuperAdmin = req.user.isSuperAdmin;
  if (!hasPermission && !isSuperAdmin) {
    return res
      .status(403)
      .json({ message: `User has insufficient permissions.` });
  }

  try {
  } catch (error) {
    next(error);
  }
}

export async function editDocsCategory(req, res, next) {
  // Permission check
  const hasPermission = req.user.permissions.includes(
    "docsCategoriesCanManage"
  );
  const isSuperAdmin = req.user.isSuperAdmin;
  if (!hasPermission && !isSuperAdmin) {
    return res
      .status(403)
      .json({ message: `User has insufficient permissions.` });
  }

  try {
  } catch (error) {
    next(error);
  }
}
