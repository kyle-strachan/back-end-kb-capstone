// Default error handler

export default function errorHandler(err, req, res, next) {
  // Log full details
  console.error(err);

  // Default response
  let status = 500;
  let message = "An unexpected error occurred.";
  let code = "SERVER_ERROR";

  // Handle known error types
  if (err.name === "ValidationError") {
    status = 400;
    message = "Validation failed.";
    code = "VALIDATION_ERROR";
  } else if (err.code === 11000) {
    // Mongo duplicate key
    status = 400;
    message = "Duplicate record detected.";
    code = "DUPLICATE_KEY";
  } else if (err.name === "CastError") {
    status = 400;
    message = "Invalid identifier format.";
    code = "INVALID_ID";
  }

  res.status(status).json({ message, code });
}
