import { Router } from "express";
import {
  getLocations,
  newLocation,
  toggleLocationIsActive,
} from "../controllers/configLocationsController.js";
import {
  editSystemCategory,
  getSystemCategories,
  newSystemCategory,
} from "../controllers/configSystemCategoriesController.js";
import {
  getDepartments,
  newDepartment,
  toggleDepartmentIsActive,
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

// import { authMiddleware } from ...
// import { noCache } from ...

const router = Router();

// Config locations
router.get("/locations", getLocations);
router.post("/locations", newLocation);
router.patch("/locations/:id/activate", toggleLocationIsActive(true));
router.patch("/locations/:id/deactivate", toggleLocationIsActive(false));

// Config system categories
router.get("/system-categories", getSystemCategories);
router.post("/system-categories", newSystemCategory);
router.patch("/system-categories/:id", editSystemCategory);

// Config system applications
router.get("/system-applications", getSystemApplications);
router.post("/system-applications", newSystemApplication);
router.patch("/system-applications/:id", editSystemApplication);

// Config departments
router.get("/departments", getDepartments);
router.post("/departments", newDepartment);
router.patch("/departments/:id/activate", toggleDepartmentIsActive(true));
router.patch("/departments/:id/deactivate", toggleDepartmentIsActive(false));

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
