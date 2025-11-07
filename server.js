import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import "dotenv/config";

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
// app.use("/", jotRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: "API route not defined. See documentation for public endpoints.",
  });
});

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
