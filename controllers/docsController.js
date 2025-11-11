import Doc from "../models/docs.js";

// TO DO: USER FIELD AND AT FIELDS MUST BE POPULATED

export async function getDocs(req, res, next) {
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
