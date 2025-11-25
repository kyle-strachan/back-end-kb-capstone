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
  editBusinessRole,
  getBusinessRoles,
  newBusinessRole,
} from "../controllers/configSystemBusinessRolesController.js";
import {
  editPlatformRole,
  getPlatformRoles,
  newPlatformRole,
} from "../controllers/configPlatformRolesController.js";
import {
  editDocsCategory,
  getDocsCategories,
  newDocsCategory,
} from "../controllers/configDocsCategoriesController.js";
import { getPermissions } from "../controllers/configPermissionsController.js";
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
  requirePermission("departments.CanManage"),
  getDepartments
); // Get all departments
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

// Config business roles
// router.get("/business-roles", authMiddleware, attachUser, getBusinessRoles);
// router.post("/business-roles", authMiddleware, attachUser, newBusinessRole);
// router.patch(
//   "/business-roles/:id",
//   authMiddleware,
//   attachUser,
//   editBusinessRole
// );

// Config platform roles
// router.get("/platform-roles", authMiddleware, attachUser, getPlatformRoles);
// router.post("/platform-roles", authMiddleware, attachUser, newPlatformRole);
// router.patch(
//   "/platform-roles/:id",
//   authMiddleware,
//   attachUser,
//   editPlatformRole
// );

// Doc categories
router.get(
  "/docs-categories",
  authMiddleware,
  attachUser,
  requirePermission("docsCategories.CanManage"),
  getDocsCategories
); // Get all document categories
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
