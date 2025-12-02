import Doc from "../models/docs.js";

export async function getDocsTree(req, res, next) {
  try {
    // superAdmins can view all documents, regardless of department ownership
    const isSuperAdmin = req.user.isSuperAdmin;

    // Tree only shows arctive (not archived documents)
    let query = { isArchived: false };

    if (!Array.isArray(req.user.department)) {
      return res.status(400).json({ message: "Department array invalid." });
    }

    if (!isSuperAdmin) {
      // Normal users, can only see documents with their department ownership plus all 'public' documents
      // A public document is one shared regardless of user's department.

      query.$or = [
        { isPublic: true },
        { department: { $in: req.user.department } },
      ];
    }

    const docs = await Doc.find(query)
      .populate("department")
      .populate("docsCategory")
      .lean();

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

    return res.status(200).json({ items });
  } catch (error) {
    next(error);
  }
}
