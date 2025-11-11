import jwt from "jsonwebtoken";
import User from "../models/users.js";

export function signAccessToken(user) {
  return jwt.sign(
    { sub: user._id, tokenVersion: user.tokenVersion },
    process.env.ACCESS_SECRET,
    {
      expiresIn: "15m",
    }
  );
}

export function signRefreshToken(user) {
  return jwt.sign(
    { sub: user._id, tokenVersion: user.tokenVersion },
    process.env.REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

export async function authMiddleware(req, res, next) {
  const accessToken = req.cookies?.accessToken;
  const refreshToken = req.cookies?.refreshToken;

  if (!accessToken && !refreshToken) {
    // No access token or refresh token provided, return to login
    return res.status(401).json({ message: "User not authorised." });
  }

  if (accessToken) {
    // accessToken present, check if it's still valid
    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_SECRET);
      req.userId = decoded.sub;
      return next();
    } catch (error) {
      // Allows only expired token to proceed, everything else results in 401
      if (error.name !== "TokenExpiredError") {
        return res.status(401).json({ message: "User not authorised." });
      }
      // Fall through to refresh token
    }
  }

  // Check if accessToken can be refreshed with valid refreshToken
  if (!refreshToken) {
    // No refresh token to refresh, cannot reissue accessToken, new login required
    return res.status(401).json({ message: "User not authorised." });
  }

  try {
    // refreshToken exists, verify if still valid.
    const decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const user = await User.findById(decodedRefresh.sub);

    if (!user || user.tokenVersion !== decodedRefresh.tokenVersion) {
      return res.status(401).json({ message: "User unauthorised." });
    }
    const newAccessToken = signAccessToken(user);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 mins
    });
    // Set user ID for the current request
    req.userId = user._id;
    return next();
  } catch (refreshError) {
    // Refresh token exists but is invalid or expired, new login required.
    return res.status(401).json({ message: "User not authorised." });
  }
}

// Add userId for required protected queries
export async function attachUser(req, res, next) {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "User not authorised." });
    }
    const user = await User.findById(req.userId).select("-passwordHash");
    if (!user) {
      return res.status(401).json({ message: "User not authorised." });
    }
    if (user.isActive === false) {
      return res.status(403).json({ message: "User is not active." });
    }
    req.user = user; // Accessible using req.user.userTableField
    return next();
  } catch (error) {
    return next(error);
  }
}
