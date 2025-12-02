import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import "dotenv/config";
import authRoutes from "./routes/authRoutes.js";
import configRoutes from "./routes/configRoutes.js";
import docRoutes from "./routes/docRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import uacRoutes from "./routes/uacRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import cors from "cors";

// Check for environment variable before proceeding
try {
  if (
    !process.env.MONGO_URI ||
    !process.env.ACCESS_SECRET ||
    !process.env.REFRESH_SECRET ||
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
const allowedOrigins = process.env.CORS_ORIGINS.split(",");
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow server-to-server calls (no origin)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Middleware
app.use(cookieParser());
app.use(express.json());

// Config routes
app.use("/api/auth", authRoutes);
app.use("/api/config", configRoutes);
app.use("/api/docs", docRoutes);
app.use("/api/users", userRoutes);
app.use("/api/uac", uacRoutes);

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
      console.log(`Server is running.`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB: ", error);
  });
