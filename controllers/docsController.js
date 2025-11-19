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

  // debugger;

  try {
    const docs = await Doc.find()
      .sort({ name: 1 })
      .populate("createdBy")
      .populate("department", "department")
      .populate("docsCategory", "category");
    if (docs.length === 0) {
      return res.status(404).json({ message: `No documents found.` });
    }
    return res.status(200).json({ docs });
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

  // debugger;

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

export async function toggleArchiveDoc(archive) {
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

export async function getDocsTree(req, res, next) {
  // debugger;

  try {
    // Get all docs
    const docs = await Doc.find()
      .populate("department")
      .populate("docsCategory");

    const departmentMap = {};

    // Loop through each doc and push into tree. If it doesn't exist, create it.
    for (const doc of docs) {
      const department = doc.department;
      if (!department) continue; // in case it's missing in the database, skip.

      const depId = String(department._id);
      const depName = department.department;

      // Check whether department exists in map
      if (!departmentMap[depId]) {
        departmentMap[depId] = {
          id: depId,
          label: depName,
          children: [], // categories will be inserted here
        };
      }

      const depNode = departmentMap[depId];

      // Get category
      const category = doc.docsCategory;
      const catId = category ? String(category._id) : "0"; // Should never happen — remove later.
      const catLabel = category ? category.category : "Uncategorised";

      // Check if category id already exists in the department
      let catNode = depNode.children.find((c) => c.id === catId);

      if (!catNode) {
        catNode = {
          id: catId,
          label: catLabel,
          children: [], // Will contain individual docs
        };
        depNode.children.push(catNode); // insert catNode if not present
      }

      // Push the document into the map
      catNode.children.push({
        id: String(doc._id),
        label: doc.title,
        fileType: "doc", // Hard-coding all docs as file icons for now
      });
    }

    let items = Object.values(departmentMap);

    // Sort by departments
    items.sort((a, b) => a.label.localeCompare(b.label));

    // Sort by categories and documents
    for (const dep of items) {
      dep.children.sort((a, b) => a.label.localeCompare(b.label)); // categories

      for (const cat of dep.children) {
        cat.children.sort((a, b) => a.label.localeCompare(b.label)); // documents
      }
    }

    // debugger;
    return res.status(200).json({ items });
  } catch (error) {
    next(error);
  }
}
