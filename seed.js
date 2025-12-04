import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/users.js";
import Department from "./models/configDepartment.js";
import Location from "./models/configLocation.js";

dotenv.config();

async function runSeed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Seed departments
    const defaultDepartment = await Department.create({
      department: "General",
    });

    // Seed locations
    const defaultLocation = await Location.create({
      location: "Site A",
    });

    // Admin user
    const superAdminExists = await User.findOne({ username: "admin" });

    if (!superAdminExists) {
      const user = new User({
        username: "admin",
        fullName: "Super Admin",
        location: defaultLocation._id,
        department: [defaultDepartment._id],
        email: "admin@example.com",
        position: "Administrator",
        isSuperAdmin: true,
        roles: ["SystemAdmin"],
        passwordHash: "admin123", // Default password
        passwordMustChange: false,
      });

      await user.save();

      console.log("Super Admin created:");
      console.log("Username: admin");
      console.log("Password: admin123");
    }

    console.log("Script complete.");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

runSeed();
