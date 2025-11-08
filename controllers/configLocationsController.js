import Location from "../models/configLocations.js";

export async function getLocations(req, res, next) {
  try {
    const locations = await Location.find().sort({ name: 1 });
    if (!locations || locations.length === 0) {
      return res.status(404).json({ message: `No applications found.` });
    }
    return res.status(200).json(locations);
  } catch (error) {
    next(error);
  }
}

export async function newLocation(req, res, next) {
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

export function toggleLocationIsActive(changeTo) {
  return async function (req, res, next) {
    try {
      const { id } = req.params; // location id to
      const location = await Location.findById(id);

      if (!location) {
        res.status(404).json({ message: "Location not found" });
      }

      location.isActive = changeTo;
      await location.save();

      return res
        .status(200)
        .json({ message: `Location status successfully changed.` });
    } catch (error) {
      next(error);
    }
  };
}
