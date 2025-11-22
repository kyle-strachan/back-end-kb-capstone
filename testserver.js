// testserver.js
import express from "express";
import cookieParser from "cookie-parser";
import configRoutes from "./routes/configRoutes.js";

// Create a barebones app for testing
const app = express();
app.use(express.json());
app.use(cookieParser());

// Mount your routes exactly like server.js does
app.use("/api/config", configRoutes);

// Export the app so supertest can use it
export default app;
