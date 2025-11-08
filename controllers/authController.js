export async function login(req, res) {
  try {
    // Do login
    return res.status(200).json({ message: "Logged in successfully." });

    // Set failedCount to zero
  } catch (error) {
    return res.status(401).json({ message: "User not authorised." });
  }
}

export async function logout(req, res) {
  try {
    // Logout
    return res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    return res.status(200).json({ message: `Error during logout. ${error}` });
  }
}
