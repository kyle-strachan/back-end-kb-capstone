import User from "../models/users.js";
import {
  signAccessToken,
  signRefreshToken,
} from "../middleware/authMiddleware.js";

// Define username and password contraints
const USERNAME_MIN_LENGTH = 3;
const PASSWORD_MIN_LENGTH = 8;
const REGEX_USERNAME = /^[a-zA-Z0-9_]+$/;
const REGEX_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/;

export async function login(req, res) {
  try {
    // Prevent resuming an abandoned session when switching users.
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    const { username, password } = req.body;

    const trimmedUsername = username.trim().toLowerCase();
    const trimmedPassword = password.trim();

    // Test if user exists
    const user = await User.findOne({ username: trimmedUsername });
    if (!user) {
      return res.status(400).json({ message: "User does not exist." });
    }

    // Test user is active
    if (!user.isActive) {
      return res.status(403).json({ message: "User does not active." });
    }

    // Test if password matches
    const isValidPassword = await user.isValidPassword(trimmedPassword);
    if (!isValidPassword) {
      // Increment failed login counter
      await User.findByIdAndUpdate(user.id, { $inc: { failedLoginCount: 1 } });
      return res
        .status(401)
        .json({ message: "Invalid login credentials, please try again." });
    }

    // Userame and password validation successful. Reset failed login count
    await User.findByIdAndUpdate(user._id, {
      failedLoginCount: 0,
    });

    // Create and issue tokens
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Mitigates CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Mitigates CSRF
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Only necessary fields returned to front end
    return res.status(200).json({
      message: "Login successful.",
      user: {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        department: user.department,
        location: user.location,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An unexpected login error occurred." });
  }
}

export async function logout(req, res) {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "User not authorised." });
    }

    // Increment tokenVersion to invalidate all existing refresh tokens
    await User.findByIdAndUpdate(req.userId, { $inc: { tokenVersion: 1 } });

    // Remove both token if logout is forced
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    return res.status(500).json({ message: `Error during logout. ${error}` });
  }
}

export async function resetPassword(req, res) {
  debugger;
  try {
    const { userId, newPassword } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.passwordMustChange = true;
    // user.passwordHash = await user.hashPassword(newPassword);
    user.passwordHash = newPassword; // hashing moved to model
    user.tokenVersion += 1;
    await user.save();

    res.status(200).json({ message: "Password reset successful." });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password." });
  }
}

export async function changePassword(req, res) {
  debugger;
  try {
    const { newPassword } = req.body;
    const userIdToChange = req.user._id;
    const user = await User.findById(userIdToChange);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found, unable to update password." });
    }

    user.passwordMustChange = false;
    user.passwordUpdatedBy = user.id;
    user.passwordUpdatedAt = new Date();
    user.passwordHash = newPassword; // hashing moved to model
    user.tokenVersion += 1;
    await user.save();

    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    res.status(500).json({ message: "Unknown error changing password." });
  }
}
