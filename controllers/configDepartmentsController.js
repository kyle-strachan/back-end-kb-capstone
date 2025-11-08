import Department from "../models/configDepartments.js";

export async function getDepartments(req, res, next) {
  try {
    const departments = await Department.find().sort({ department: 1 });
    if (!departments || departments.length === 0) {
      return res.status(404).json({ message: `No departments found.` });
    }
    return res.status(200).json(departments);
  } catch (error) {
    next(error);
  }
}

export async function newDepartment(req, res, next) {
  try {
    const { department } = req.body;
    await Department.create({
      department,
    });
    return res
      .status(200)
      .json({ message: `${department} successfully created.` });
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

      return res
        .status(200)
        .json({ message: `Department status successfully changed.` });
    } catch (error) {
      next(error);
    }
  };
}
