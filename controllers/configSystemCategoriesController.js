import SystemCategory from "../models/configSystemCategories.js";

export async function newSystemCategory(req, res, next) {
  try {
    const { category } = req.body;

    if (!category || !category.trim())
      return res.status(400).json({ message: "Invalid category name." });

    await SystemCategory.create({
      category,
    });
    res.status(201).json({ message: `${category} successfully created.` });
  } catch (error) {
    next(error);
  }
}

export async function editSystemCategory(req, res, next) {
  try {
    const { category } = req.body;
    if (!category || !category.trim())
      return res.status(400).json({ message: "Invalid category name." });

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
