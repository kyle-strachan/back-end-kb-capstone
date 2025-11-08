export async function register(req, res) {
  try {
    res.status(200).json({ message: "User successfully created" });
  } catch (error) {
    res.status(200).json({ message: `Error creating user: ${error}` });
  }
}

export async function getUsers(req, res) {
  try {
    res.status(200).json({ message: "List of users." });
  } catch (error) {
    res.status(500).json({ message: `Unable to fetch users. ${error}` });
  }
}
