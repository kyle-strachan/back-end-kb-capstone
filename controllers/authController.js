import User from "../models/users.js";
import {
  signAccessToken,
  signRefreshToken,
} from "../middleware/authMiddleware.js";
import { cleanUser } from "../utils/cleanUser.js";
import {
  IS_PRODUCTION,
  COOKIE_BASE_OPTIONS,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from "../utils/constants.js";

export async function login(req, res) {
  try {
    // Clear cookies
    res.clearCookie("refreshToken", COOKIE_BASE_OPTIONS);
    res.clearCookie("accessToken", COOKIE_BASE_OPTIONS);

    const { username, password } = req.body;
    const trimmedUsername = username.trim().toLowerCase();
    const trimmedPassword = password.trim();

    const user = await User.findOne({ username: trimmedUsername });
    if (!user) {
      return res.status(400).json({ message: "User does not exist." });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "User is not active." });
    }

    const isValidPassword = await user.isValidPassword(trimmedPassword);
    if (!isValidPassword) {
      await User.findByIdAndUpdate(user.id, { $inc: { failedLoginCount: 1 } });
      return res
        .status(401)
        .json({ message: "Invalid login credentials, please try again." });
    }

    await User.findByIdAndUpdate(user._id, {
      failedLoginCount: 0,
    });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      ...COOKIE_BASE_OPTIONS,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });

    res.cookie("accessToken", accessToken, {
      ...COOKIE_BASE_OPTIONS,
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });

    return res.status(200).json({
      message: "Login successful.",
      user: cleanUser(user),
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

    // Clear cookies
    res.clearCookie("refreshToken", COOKIE_BASE_OPTIONS);
    res.clearCookie("accessToken", COOKIE_BASE_OPTIONS);

    return res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    return res.status(500).json({ message: `Error during logout. ${error}` });
  }
}

export async function resetPassword(req, res) {
  try {
    const { userId, newPassword } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.passwordMustChange = true;
    user.passwordHash = newPassword; // hashing moved to model
    user.tokenVersion += 1;
    await user.save();

    res.status(200).json({ message: "Password reset successful." });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password." });
  }
}

export async function changePassword(req, res) {
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
