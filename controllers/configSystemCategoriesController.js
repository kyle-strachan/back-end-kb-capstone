import SystemCategory from "../models/configSystemCategories.js";

export async function getSystemCategories(req, res, next) {
  try {
    const systemCategories = await SystemCategory.find().sort({ name: 1 });
    if (!systemCategories || systemCategories.length === 0) {
      return res.status(404).json({ message: `No applications found.` });
    }
    return res.status(200).json(systemCategories);
  } catch (error) {
    next(error);
  }
}

export async function newSystemCategory(req, res, next) {
  try {
    const { category } = req.body;

    if (!category || !category.trim()) {
      return res.status(400).json({ message: "Invalid category name." });
    }

    await SystemCategory.create({
      category,
    });
    return res
      .status(201)
      .json({ message: `${category} successfully created.` });
  } catch (error) {
    next(error);
  }
}

export async function editSystemCategory(req, res, next) {
  try {
    const { category } = req.body;
    if (!category || !category.trim()) {
      return res.status(400).json({ message: "Invalid category name." });
    }

    const updatedCategory = await SystemCategory.findByIdAndUpdate(
      req.params.id,
      { category },
      { runValidators: true, new: true }
    );

    if (!updatedCategory)
      return res.status(404).json({ message: `Category not found.` });

    return res
      .status(200)
      .json({ message: `${updatedCategory.category} is updated.` });
  } catch (error) {
    next(error);
  }
}
