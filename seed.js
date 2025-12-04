import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/users.js";
import Department from "./models/configDepartments.js";
import Location from "./models/configLocations.js";
import System from "./models/configSystemApplications.js";
import Category from "./models/configSystemCategories.js";

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

    // Seed system
    const defaultSystem = await System.create({
      system: "System 1",
    });

    // Seed system category
    const defaultCategory = await System.create({
      category: "Category 1",
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
