import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import "dotenv/config";
import authRoutes from "./routes/authRoutes.js";
import configRoutes from "./routes/configRoutes.js";
import docRoutes from "./routes/docRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import userAccessControlMonitorRoutes from "./routes/userAccessControlMonitorRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import cors from "cors";

// import { rateLimitMiddleware } // Add later

// Check for environment variable before proceeding
try {
  if (
    // !process.env.MONGO_URI ||
    // !process.env.ACCESS_SECRET ||
    // !process.env.REFRESH_SECRET ||
    !process.env.PORT
  ) {
    throw new Error(
      "Environment variables are not configured. Refer to documentation before start."
    );
  }
} catch (error) {
  console.error(error);
  process.exit(1);
}

// App init
const app = express();
const PORT = process.env.PORT;

// Keep before routes
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Middleware
app.use(cookieParser());
app.use(express.json());
// app.use(rateLimitMiddleware);  // Implement later

// Router config with temporary logger
app.use((req, res, next) => {
  console.log(`Incoming: ${req.method} ${req.url}`);
  next();
});

// Config routes
app.use("/api/auth", authRoutes);
app.use("/api/config", configRoutes);
app.use("/api/docs", docRoutes);
app.use("/api/users", userRoutes);
app.use("/api/uac", userAccessControlMonitorRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: "API route not defined. See documentation for public endpoints.",
  });
});

// Error handler
app.use(errorHandler);

// Database connection and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB: ", error);
  });
