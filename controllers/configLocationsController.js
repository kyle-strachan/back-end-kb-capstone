import Location from "../models/configLocations.js";

export async function newLocation(req, res, next) {
  try {
    const { location } = req.body;
    await Location.create({
      location,
    });
    res.status(200).json({ message: `${location} successfully created.` });
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

      res
        .status(200)
        .json({ message: `Location status successfully changed.` });
    } catch (error) {
      next(error);
    }
  };
}
