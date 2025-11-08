import User from "../models/users.js";

export async function getUsers(req, res, next) {
  try {
    res.status(200).json({ message: "List of users." });
  } catch (error) {
    next(error);
  }
}

export async function register(req, res, next) {
  try {
    const {
      username,
      fullName,
      location,
      department,
      email,
      position,
      password,
      permissions,
    } = req.body;

    let passwordHash = "XXXX123";

    await User.create({
      username,
      fullName,
      location,
      department,
      email,
      position,
      passwordHash,
      permissions,
    });
    res.status(200).json({ message: `${username} successfully created.` });
  } catch (error) {
    next(error);
  }
}
