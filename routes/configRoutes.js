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
import { getPermissions } from "../controllers/configPermissionsController.js";
import { authMiddleware, attachUser } from "../middleware/authMiddleware.js";
import {
  editDepartmentCategory,
  getDepartmentCategories,
  newDepartmentCategory,
} from "../controllers/configDepartmentCategoriesController.js";
// import { noCache } from ...

const router = Router();

// Config locations
router.get("/locations", getLocations);
router.post("/locations", newLocation);
router.put("/locations", authMiddleware, attachUser, editLocations);

// Config system categories
router.get("/system-categories", getSystemCategories);
router.post("/system-categories", newSystemCategory);
router.put("/system-categories", editSystemCategory);

// Config system applications
router.get("/system-applications", getSystemApplications);
router.post("/system-applications", newSystemApplication);
router.patch("/system-applications/:id", editSystemApplication);

// Config departments
router.get("/departments", getDepartments);
router.post("/departments", newDepartment);
router.put("/departments", authMiddleware, attachUser, editDepartments);

// Config department categories
router.get(
  "/department-categories",
  authMiddleware,
  attachUser,
  getDepartmentCategories
);
router.post(
  "/department-categories",
  authMiddleware,
  attachUser,
  newDepartmentCategory
);
router.patch(
  "/department-categories/:id",
  authMiddleware,
  attachUser,
  editDepartmentCategory
);

// Config business roles
router.get("/business-roles", getBusinessRoles);
router.post("/business-roles", newBusinessRole);
router.patch("/business-roles/:id", editBusinessRole);

// Config platform roles
router.get("/platform-roles", getPlatformRoles);
router.post("/platform-roles", newPlatformRole);
router.patch("/platform-roles/:id", editPlatformRole);

// Config permissions
router.get("/permissions", getPermissions);

export default router;
