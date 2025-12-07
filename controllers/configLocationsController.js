import Location from "../models/configLocations.js";
import { MINIMUM_LOCATION_LENGTH } from "../utils/constants.js";
import { isValidObjectId } from "../utils/validation.js";

export async function getLocations(req, res, next) {
  try {
    // Filter to active locations if not admin
    const viewAll =
      req.user.isSuperAdmin || req.user.roles.includes("SystemAdmin");
    const filter = viewAll ? {} : { isActive: true }; // Only show active locations to non-admin.

    const locations = await Location.find().sort({ location: 1 }).lean();
    if (!locations || locations.length === 0) {
      return res.status(404).json({ message: `No locations found.` });
    }
    return res.status(200).json({ locations });
  } catch (error) {
    next(error);
  }
}

export async function newLocation(req, res, next) {
  try {
    const { location } = req.body;
    if (typeof location !== "string") {
      return res.status(400).json({ message: "Invalid location name." });
    }
    const trimmedLocation = location?.trim();

    // Validate inputs
    if (!trimmedLocation || trimmedLocation.length < MINIMUM_LOCATION_LENGTH) {
      return res.status(400).json({
        message: `A new location must have at least ${MINIMUM_LOCATION_LENGTH} characters.`,
      });
    }

    // Insert new location
    await Location.create({
      location: trimmedLocation,
    });
    return res
      .status(200)
      .json({ message: `${trimmedLocation} successfully created.` });
  } catch (error) {
    next(error);
  }
}

export async function editLocations(req, res, next) {
  try {
    const updates = req.body.updates;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: "No updates provided." });
    }

    // Create array for results, allows multiple edits in one api call.
    const results = [];

    // Validate batch promises
    for (const update of updates) {
      // Check location is string
      const location =
        typeof update.location === "string" ? update.location.trim() : "";

      // Check id and location value
      if (!update._id || !isValidObjectId(update._id) || !location) {
        results.push({
          id: update._id,
          success: false,
          message: "Invalid ID or location name.",
        });
        continue;
      }

      // Check location length, update results table if failed
      if (location.length < MINIMUM_LOCATION_LENGTH) {
        results.push({
          id: update._id,
          success: false,
          message: `Location name must be at least ${MINIMUM_LOCATION_LENGTH} characters`,
        });
        continue;
      }

      try {
        const result = await Location.findByIdAndUpdate(
          update._id,
          {
            location,
            ...(update.isActive !== undefined && {
              isActive: Boolean(
                update.isActive === true || update.isActive === "true" // Ensure isActive is true boolean
              ),
            }),
          },
          { runValidators: true, new: true, strict: "throw" } // Force reject extra fields
        );

        // If no found location, update results table with failure
        if (!result) {
          results.push({
            id: update._id,
            success: false,
            message: `No matching location ID found.`,
          });
          continue;
        }

        // Success, update results table
        results.push({ id: update._id, success: true });
      } catch (error) {
        results.push({
          id: update._id,
          success: false,
          message: error.message,
        });
      }
    }

    res.status(200).json({
      message: "Updates processed.",
      results,
    });
  } catch (error) {
    next(error);
  }
}
