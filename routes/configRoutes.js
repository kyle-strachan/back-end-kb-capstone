import { Router } from "express";
import {
  editLocations,
  getLocations,
  newLocation,
} from "../controllers/configLocationsController.js";
import {
  editSystemCategory,
  getSystemCategories,
  newSystemCategory,
} from "../controllers/configSystemCategoriesController.js";
import {
  getDepartments,
  newDepartment,
  editDepartments,
} from "../controllers/configDepartmentsController.js";
import {
  editSystemApplication,
  getSystemApplications,
  newSystemApplication,
} from "../controllers/configSystemApplicationsController.js";
import {
  editDocsCategory,
  getDocsCategories,
  newDocsCategory,
} from "../controllers/configDocsCategoriesController.js";
import {
  authMiddleware,
  attachUser,
  requirePermission,
} from "../middleware/authMiddleware.js";

const router = Router();

// Router controls all document routes
// Prefix: /api/config

// Config locations
router.get(
  "/locations",
  authMiddleware,
  attachUser,
  requirePermission("locations.CanManage"),
  getLocations
); // Get all locations
router.post(
  "/locations",
  authMiddleware,
  attachUser,
  requirePermission("locations.CanManage"),
  newLocation
); // Create a new location
router.put(
  "/locations",
  authMiddleware,
  attachUser,
  requirePermission("locations.CanManage"),
  editLocations
); // Edit an existing location name

// Config system categories
router.get(
  "/system-categories",
  authMiddleware,
  attachUser,
  requirePermission("systems.CanManage"),
  getSystemCategories
); // Get all system categories
router.post(
  "/system-categories",
  authMiddleware,
  attachUser,
  requirePermission("systems.CanManage"),
  newSystemCategory
); // Create a new system category
router.put(
  "/system-categories",
  authMiddleware,
  attachUser,
  requirePermission("systems.CanManage"),
  editSystemCategory
); // Edit an existing system category

// Config system applications
router.get(
  "/system-applications",
  authMiddleware,
  attachUser,
  requirePermission("systems.CanManage"),
  getSystemApplications
); // Get all systems
router.post(
  "/system-applications",
  authMiddleware,
  attachUser,
  requirePermission("systems.CanManage"),
  newSystemApplication
); // Create new system
router.put(
  "/system-applications/:id",
  authMiddleware,
  attachUser,
  requirePermission("systems.CanManage"),
  editSystemApplication
); // Edit an existing system

// Config departments
router.get(
  "/departments",
  authMiddleware,
  attachUser,
  // requirePermission("departments.CanManage"),
  getDepartments
); // Get all departments, no permission required, populates drop down boxes.
router.post(
  "/departments",
  authMiddleware,
  attachUser,
  requirePermission("departments.CanManage"),
  newDepartment
); // Create a new department
router.put(
  "/departments",
  authMiddleware,
  attachUser,
  requirePermission("departments.CanManage"),
  editDepartments
); // Edit an existing department

// Doc categories
router.get("/docs-categories", authMiddleware, attachUser, getDocsCategories); // Get all document categories, no permission check, populates drop down boxes
router.post(
  "/docs-categories",
  authMiddleware,
  attachUser,
  requirePermission("docsCategories.CanManage"),
  newDocsCategory
); // Create a new document category
router.patch(
  "/docs-categories",
  authMiddleware,
  attachUser,
  requirePermission("docsCategories.CanManage"),
  editDocsCategory
); // Edit an existing document category

export default router;
