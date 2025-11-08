import Department from "../models/configDepartments.js";

export async function newDepartment(req, res, next) {
  try {
    const { department } = req.body;
    await Department.create({
      department,
    });
    res.status(200).json({ message: `${department} successfully created.` });
  } catch (error) {
    next(error);
  }
}

export function toggleDepartmentIsActive(changeTo) {
  return async function (req, res, next) {
    try {
      const { id } = req.params;
      const department = await Department.findById(id);

      if (!department) {
        res.status(404).json({ message: "Department not found" });
      }

      department.isActive = changeTo;
      await department.save();

      res
        .status(200)
        .json({ message: `Department status successfully changed.` });
    } catch (error) {
      next(error);
    }
  };
}
