import Location from "../models/configLocations.js";

const minimumLocationCharacterLength = 3;

export async function getLocations(req, res, next) {
  try {
    // debugger;
    const locations = await Location.find().sort({ name: 1 });
    if (!locations || locations.length === 0) {
      return res.status(404).json({ message: `No applications found.` });
    }
    return res.status(200).json({ locations });
  } catch (error) {
    next(error);
  }
}

export async function newLocation(req, res, next) {
  // debugger;
  try {
    const { location } = req.body;
    await Location.create({
      location,
    });
    return res
      .status(200)
      .json({ message: `${location} successfully created.` });
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

    const results = [];

    // Validate batch promises
    for (const update of updates) {
      if (!update._id || typeof update.location !== "string") {
        results.push({
          id: update._id,
          success: false,
          message: "Invalid ID or location name.",
        });
        continue;
      }
      // Check location name is long enough.
      // debugger;
      if (update.location.trim().length < minimumLocationCharacterLength) {
        results.push({
          id: update._id,
          success: false,
          message: `Location name must be at least ${minimumLocationCharacterLength} characters`,
        });
        continue;
      }

      try {
        const result = await Location.findByIdAndUpdate(
          update._id,
          {
            location: update.location.trim(),
            isActive: !!update.isActive, // in case field is not changed and is null
          },
          { runValidators: true, new: true, strict: "throw" }
        );
        if (!result) {
          results.push({
            id: update._id,
            success: false,
            message: `No matching location ID found.`,
          });
          return;
        }
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
      message: "Batch processed.",
      results,
    });
  } catch (error) {
    next(error);
  }
}
