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

// import { authMiddleware } from ...
// import { noCache } from ...

const router = Router();

// Config locations
router.get("/locations", getLocations);
router.post("/locations", newLocation);
router.patch("/locations/:id/activate", toggleLocationIsActive(true));
router.patch("/locations/:id/deactivate", toggleLocationIsActive(false));

// Config system categories
router.get("/systemCategories", getSystemCategories);
router.post("/systemCategories", newSystemCategory);
router.patch("/systemCategories/:id", editSystemCategory);

// Config system applications
router.get("/systemApplications", getSystemApplications);
router.post("/systemApplications", newSystemApplication);
router.patch("/systemApplications/:id", editSystemApplication);

// Config departments
router.get("/departments", getDepartments);
router.post("/departments", newDepartment);
router.patch("/departments/:id/activate", toggleDepartmentIsActive(true));
router.patch("/departments/:id/deactivate", toggleDepartmentIsActive(false));

// Config business roles
router.get("/businessRoles", getBusinessRoles);
router.post("/businessRoles", newBusinessRole);
router.patch("/businessRoles/:id", editBusinessRole);

// Config platform roles
router.get("/platformRoles", getPlatformRoles);
router.post("/platformRoles", newPlatformRole);
router.patch("/platformRoles/:id", editPlatformRole);

export default router;
