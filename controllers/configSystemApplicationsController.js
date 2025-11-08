import SystemCategory from "../models/configSystemCategories.js";

export async function newSystemCategory(req, res, next) {
  try {
    const { category } = req.body;
    await SystemCategory.create({
      category,
    });
    res.status(200).json({ message: `${category} successfully created.` });
  } catch (error) {
    next(error);
  }
}
