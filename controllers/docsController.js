import Doc from "../models/docs.js";
import { isValidObjectId } from "../utils/validation.js";
import { wasabi } from "../utils/wasabi.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

// TO DO: USER FIELD AND AT FIELDS MUST BE POPULATED

export async function getDocs(req, res, next) {
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
  try {
    const docId = req.params.id;
    const doc = await Doc.findById(docId)
      .populate("createdBy")
      .populate("lastModifiedBy")
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
  // debugger;
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
      isArchived,
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

    const docId = req.params.id;
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

export async function getDocsTree(req, res, next) {
  try {
    // Get all active docs that user is department member

    const isSuperAdmin = req.user.isSuperAdmin;

    // Return active documents for user's department, or all docs for super admin.
    const docs = await Doc.find({
      isArchived: false,
      ...(isSuperAdmin ? {} : { department: { $in: req.user.department } }),
    })
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

    return res.status(200).json({ items });
  } catch (error) {
    next(error);
  }
}

export async function uploadImage(req, res, next) {
  try {
    const docId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Sanitize + resize + convert
    const processedImageBuffer = await sharp(req.file.buffer)
      .resize({
        width: 1000,
        withoutEnlargement: true, // <-- prevents upscaling
      })
      .webp({ quality: 80 })
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

    // AFTER successfully uploading to Wasabi:
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
    const { key } = req.query; // e.g. "documents/6921.../12345.webp"
    const Bucket = process.env.WASABI_BUCKET;

    const signedUrl = await getSignedUrl(
      wasabi,
      new GetObjectCommand({ Bucket, Key: key }),
      { expiresIn: 60 } // valid for 60 seconds (adjust as needed)
    );

    res.json({ url: signedUrl });
  } catch (error) {
    console.error("Failed to sign URL:", error);
    next(error);
  }
}

// Helper to generate a snippet around the first matched term
function makeSnippet(text, terms, maxLen = 200) {
  if (!text) return "";
  const normalized = text.toLowerCase();
  let idx = -1;

  for (const t of terms) {
    const i = normalized.indexOf(t.toLowerCase());
    if (i !== -1) {
      idx = i;
      break;
    }
  }

  if (idx === -1) {
    // fallback: just return the start of the text
    return text.slice(0, maxLen) + (text.length > maxLen ? "…" : "");
  }

  const start = Math.max(0, idx - Math.floor(maxLen / 3));
  const snippet = text.slice(start, start + maxLen);
  return (
    (start > 0 ? "…" : "") + snippet + (start + maxLen < text.length ? "…" : "")
  );
}

export async function getDocsSearch(req, res, next) {
  // Return department documents that user is part of, plus all public documents.
  try {
    const q = (req.query.q || "").trim();
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 20, 1),
      100
    );
    const skip = (page - 1) * limit;

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

    const [results, total] = await Promise.all([
      Doc.find(
        {
          $text: { $search: q },
          isArchived: false, // Search only return active documents
          department: { $in: req.user.department }, // Return only documents for which user is member of department
        },
        projection
      )
        .populate("docsCategory", "category")
        .populate("department", "department")
        .sort({ score: { $meta: "textScore" } })
        .skip(skip)
        .limit(limit),
      Doc.countDocuments({ $text: { $search: q } }),
    ]);

    // Build snippets
    const terms = q.replace(/"/g, "").split(/\s+/).filter(Boolean);
    const resultsWithSnippets = results.map((r) => ({
      ...r.toObject(),
      snippet: cleanSnippet(
        makeSnippet(r.body || r.description || r.title, terms)
      ),
    }));

    res.json({
      query: q,
      page,
      limit,
      total,
      results: resultsWithSnippets,
    });
  } catch (error) {
    next(error);
  }
}

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

function cleanSnippet(snippet) {
  const normalized = snippet.replace(/&nbsp;/g, " ");
  return DOMPurify.sanitize(normalized, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "span"],
    ALLOWED_ATTR: [],
  });
}
