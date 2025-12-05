import Doc from "../models/docs.js";
import { isValidObjectId } from "../utils/validation.js";
import { wasabi } from "../utils/wasabi.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import {
  MINIMUM_DOC_BODY_LENGTH,
  MINIMUM_DOC_TITLE_LENGTH,
  MINIMUM_DOC_DESCRIPTION_LENGTH,
} from "../utils/constants.js";

export async function getDocs(req, res, next) {
  try {
    // SuperAdmin and SystemAdmin can view all
    const viewAll =
      req.user.isSuperAdmin || req.user.roles.includes("SystemAdmin");

    // Regular users: only categories where their department matches
    const filter = viewAll ? {} : { department: { $in: req.user.department } };

    const docs = await Doc.find(filter)
      .sort({ title: 1 })
      .populate("createdBy")
      .populate("department", "department")
      .populate("docsCategory", "category")
      .lean();
    if (docs.length === 0) {
      return res.status(404).json({ message: `No documents found.` });
    }
    return res.status(200).json({ docs });
  } catch (error) {
    next(error);
  }
}

// Get single document
export async function getDoc(req, res, next) {
  try {
    const docId = req.params.id;

    if (!isValidObjectId(docId)) {
      return res.status(400).json({ message: "Invalid document ID." });
    }

    const doc = await Doc.findById(docId)
      .populate("createdBy")
      .populate("lastModifiedBy")
      .populate("department")
      .populate("docsCategory")
      .lean();

    if (!doc) {
      return res.status(404).json({ message: `Document not found.` });
    }

    // Check user is a member of this department
    const canView =
      req.user.isSuperAdmin ||
      req.user.department.includes(doc.department) ||
      doc.isPublic;

    // Reject is user is not a member.
    if (!canView) {
      return res.status(403).json({
        message: `User does not have permission to view this document.`,
      });
    }

    return res.status(200).json({ doc });
  } catch (error) {
    next(error);
  }
}

export async function newDoc(req, res, next) {
  const lastModifiedByUser = req.user.id;
  try {
    const {
      title,
      description,
      body,
      department,
      isPublic,
      docsCategory,
      isArchived,
    } = req.body;

    // Validate inputs
    if (
      typeof title !== "string" ||
      title.trim().length < MINIMUM_DOC_TITLE_LENGTH
    ) {
      return res.status(400).json({
        message: `A title must have at least ${MINIMUM_DOC_TITLE_LENGTH} characters.`,
      });
    }

    if (
      typeof description !== "string" ||
      description.trim().length < MINIMUM_DOC_DESCRIPTION_LENGTH
    ) {
      return res.status(400).json({
        message: `A description must have at least ${MINIMUM_DOC_DESCRIPTION_LENGTH} characters.`,
      });
    }

    if (
      typeof body !== "string" ||
      body.trim().length < MINIMUM_DOC_BODY_LENGTH
    ) {
      return res.status(400).json({
        message: `A document body must have at least ${MINIMUM_DOC_BODY_LENGTH} characters.`,
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

    // Check user is a member of this department
    const canCreate =
      req.user.isSuperAdmin || req.user.department.includes(department);

    // Reject is user is not a member.
    if (!canCreate) {
      return res.status(403).json({
        message: `Cannot create document, user is not a member of this department.`,
      });
    }

    const doc = await Doc.create({
      title,
      description,
      body,
      createdBy: lastModifiedByUser,
      lastModifiedBy: lastModifiedByUser,
      lastModifiedAt: new Date(), // model requires this
      department,
      isPublic: Boolean(isPublic === true || isPublic === "true"),
      docsCategory,
      isArchived: Boolean(isArchived === true || isArchived === "true"),
    });

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
  const lastModifiedByUser = req.user.id;

  try {
    const {
      title,
      description,
      body,
      department,
      isPublic,
      docsCategory,
      isArchived,
    } = req.body;

    // Validate inputs
    if (
      typeof title !== "string" ||
      title.trim().length < MINIMUM_DOC_TITLE_LENGTH
    ) {
      return res.status(400).json({
        message: `A title must have at least ${MINIMUM_DOC_TITLE_LENGTH} characters.`,
      });
    }

    if (
      typeof description !== "string" ||
      description.trim().length < MINIMUM_DOC_DESCRIPTION_LENGTH
    ) {
      return res.status(400).json({
        message: `A description must have at least ${MINIMUM_DOC_DESCRIPTION_LENGTH} characters.`,
      });
    }

    if (
      typeof body !== "string" ||
      body.trim().length < MINIMUM_DOC_BODY_LENGTH
    ) {
      return res.status(400).json({
        message: `A document body must have at least ${MINIMUM_DOC_BODY_LENGTH} characters.`,
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

    const docId = req.params.id;
    if (!isValidObjectId(docId)) {
      return res.status(400).json({ message: "Invalid document ID." });
    }

    // Check user is a member of this department
    const canEdit =
      req.user.isSuperAdmin || req.user.department.includes(department);

    // Reject is user is not a member.
    if (!canEdit) {
      return res.status(403).json({
        message: `Cannot create document, user is not a member of this department.`,
      });
    }

    const updatedDoc = await Doc.findByIdAndUpdate(
      docId,
      {
        title,
        description,
        body,
        lastModifiedBy: lastModifiedByUser,
        lastModifiedAt: new Date(), // model requires this
        department,
        isPublic,
        docsCategory: docsCategory,
        isArchived,
      },
      { runValidators: true, new: true }
    );
    if (!updatedDoc) {
      return res
        .status(404)
        .json({ message: `${docId} could not be updated.` });
    }
    return res.status(200).json({ message: `Document updated successfully.` });
  } catch (error) {
    next(error);
  }
}

export async function uploadImage(req, res, next) {
  try {
    const docId = req.params.id;

    if (!isValidObjectId(docId)) {
      return res.status(400).json({ message: "Invalid document ID." });
    }

    // Ensure document exists
    const docExists = await Doc.exists({ _id: docId });
    if (!docExists) {
      return res.status(404).json({ message: "Document does not exist." });
    }

    // Confirm a file exists to upload
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Sanitize, resize, convert
    const processedImageBuffer = await sharp(req.file.buffer)
      .resize({
        width: 1200,
        withoutEnlargement: true, // Prevent increasing image size to maximum width
      })
      .webp({ quality: 80 }) // Compressing to match web guidelines for company site
      .toBuffer();

    // Create filename
    const timestamp = Date.now();
    const fileName = `${timestamp}.webp`;

    // Wasabi path
    const Key = `documents/${docId}/${fileName}`;
    const Bucket = process.env.WASABI_BUCKET;

    // Upload to Wasabi
    await wasabi.send(
      new PutObjectCommand({
        Bucket,
        Key,
        Body: processedImageBuffer,
        ContentType: "image/webp",
      })
    );

    // After successfully uploading to Wasabi, get signed URL to display image
    const signedUrl = await getSignedUrl(
      wasabi,
      new GetObjectCommand({ Bucket, Key }),
      { expiresIn: 60 * 5 } // 5 minutes
    );

    return res.json({
      key: Key,
      url: signedUrl,
    });
  } catch (error) {
    console.error("Image upload failed:", error);
    next(error);
  }
}

export async function signUrl(req, res, next) {
  try {
    const { key } = req.query;
    const Bucket = process.env.WASABI_BUCKET;

    // Check key format
    if (typeof key !== "string") {
      return res.status(400).json({ message: "Invalid key format." });
    }

    // Verify expected prefix
    if (!key.startsWith("documents/")) {
      return res.status(400).json({ message: "Invalid key path." });
    }

    // Get docId
    const parts = key.split("/");
    const docId = parts[1];

    if (!isValidObjectId(docId)) {
      return res.status(400).json({ message: "Invalid document ID in key." });
    }

    // Confirm docId exists
    const doc = await Doc.findById(docId);
    if (!doc) {
      return res.status(404).json({ message: "Document not found." });
    }

    // Confirm user can view this document, prevents images security leak between departments
    const isSuperAdmin = req.user?.isSuperAdmin;
    const userDepartments = req.user?.department || [];

    const isAuthorised =
      isSuperAdmin ||
      doc.isPublic ||
      userDepartments.some((d) => String(d) === String(doc.department));

    if (!isAuthorised) {
      return res
        .status(403)
        .json({ message: "You are not permitted to view this document." });
    }

    // Generate secure signed URL
    const signedUrl = await getSignedUrl(
      wasabi,
      new GetObjectCommand({ Bucket, Key: key }),
      { expiresIn: 60 }
    );

    return res.json({ url: signedUrl });
  } catch (error) {
    console.error("Failed to sign URL:", error);
    next(error);
  }
}

export async function getDocsSearch(req, res, next) {
  try {
    // Trim input
    const q = (req.query.q || "").trim();

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 20, 1),
      100
    );
    const skip = (page - 1) * limit;

    // Reject missing query string
    if (!q) {
      return res.status(400).json({ error: "Missing query parameter" });
    }

    const projection = {
      score: { $meta: "textScore" },
      title: 1,
      description: 1,
      body: 1,
      updatedAt: 1,
      docsCategory: 1,
      department: 1,
    };

    const isSuperAdmin = req.user.isSuperAdmin;

    if (!Array.isArray(req.user.department)) {
      return res
        .status(400)
        .json({ message: "User department list is not an array." });
    }

    // Base search filter — always require active docs and text match
    let filter = {
      isArchived: false,
      $text: { $search: q },
    };

    if (!isSuperAdmin) {
      // Restrict normal users to their department plus or public docs
      filter.$or = [
        { isPublic: true },
        { department: { $in: req.user.department } },
      ];
    }

    const [results, total] = await Promise.all([
      Doc.find(filter, projection)
        .populate("docsCategory", "category")
        .populate("department", "department")
        .sort({ score: { $meta: "textScore" } })
        .skip(skip)
        .limit(limit),

      // IMPORTANT: count must match the same filter
      Doc.countDocuments(filter),
    ]);

    res.json({
      query: q,
      page,
      limit,
      total,
      results,
    });
  } catch (error) {
    next(error);
  }
}

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);
