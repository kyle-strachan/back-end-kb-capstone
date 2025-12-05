import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/users.js";
import Department from "./models/configDepartments.js";
import Location from "./models/configLocations.js";
import SystemApplication from "./models/configSystemApplications.js";
import SystemCategory from "./models/configSystemCategories.js";
import DocsCategory from "./models/configDocsCategories.js";
import Doc from "./models/docs.js";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  await Department.deleteMany({});
  await Location.deleteMany({});
  await SystemCategory.deleteMany({});
  await SystemApplication.deleteMany({});
  await User.deleteMany({});
  await DocsCategory.deleteMany({});
  await Doc.deleteMany({});

  const deptA = await Department.create({ department: "Front Office" });
  const deptB = await Department.create({ department: "Housekeeping" });
  const deptC = await Department.create({ department: "Engineering" });

  const locA = await Location.create({ location: "Hotel 1" });
  const locB = await Location.create({ location: "Hotel 2" });

  const sysCatA = await SystemCategory.create({ category: "Property Systems" });
  const sysCatB = await SystemCategory.create({ category: "POS Systems" });
  const sysCatC = await SystemCategory.create({ category: "HR Systems" });

  const superAdmin = new User({
    username: "admin",
    fullName: "Super Administrator",
    location: locA._id,
    department: [deptA._id],
    email: "admin@example.com",
    position: "Administrator",
    isSuperAdmin: true,
    roles: ["SystemAdmin"],
    passwordHash: "admin123",
    passwordMustChange: false,
  });
  await superAdmin.save();

  const manager = new User({
    username: "manager1",
    fullName: "Front Office Manager",
    location: locA._id,
    department: [deptA._id],
    email: "manager@example.com",
    position: "Manager",
    isSuperAdmin: false,
    roles: ["Manager"],
    passwordHash: "password123",
    passwordMustChange: false,
  });
  await manager.save();

  const staff = new User({
    username: "staff1",
    fullName: "Housekeeping Staff",
    location: locB._id,
    department: [deptB._id],
    email: "staff@example.com",
    position: "Attendant",
    isSuperAdmin: false,
    roles: ["User"],
    passwordHash: "password123",
    passwordMustChange: false,
  });
  await staff.save();

  const sysAppA = await SystemApplication.create({
    system: "Opera Cloud",
    category: sysCatA._id,
    isActive: true,
    adminUser: [superAdmin._id],
    sendEmail: false,
    description: "Property management system.",
  });

  const sysAppB = await SystemApplication.create({
    system: "Simphony POS",
    category: sysCatB._id,
    isActive: true,
    adminUser: [manager._id],
    sendEmail: false,
    description: "Point of sale system.",
  });

  const sysAppC = await SystemApplication.create({
    system: "Dayforce",
    category: sysCatC._id,
    isActive: true,
    adminUser: [superAdmin._id],
    sendEmail: false,
    description: "HR platform.",
  });

  const catA = await DocsCategory.create({
    departmentId: deptA._id,
    category: "Front Office Procedures",
  });

  const catB = await DocsCategory.create({
    departmentId: deptB._id,
    category: "Cleaning Standards",
  });

  const catC = await DocsCategory.create({
    departmentId: deptC._id,
    category: "Maintenance Guides",
  });

  await Doc.create({
    title: "Check-In Procedure",
    description: "Standard check-in workflow.",
    body: "<p>Front desk check-in process details...</p>",
    createdBy: manager._id,
    lastModifiedBy: manager._id,
    department: deptA._id,
    docsCategory: catA._id,
  });

  await Doc.create({
    title: "Room Cleaning Protocol",
    description: "Housekeeping instructions.",
    body: "<p>Cleaning procedures for all rooms...</p>",
    createdBy: staff._id,
    lastModifiedBy: staff._id,
    department: deptB._id,
    docsCategory: catB._id,
  });

  await Doc.create({
    title: "HVAC Troubleshooting",
    description: "Guide for engineering staff.",
    body: "<p>HVAC troubleshooting guide...</p>",
    createdBy: superAdmin._id,
    lastModifiedBy: superAdmin._id,
    department: deptC._id,
    docsCategory: catC._id,
  });

  process.exit(0);
}

run();
