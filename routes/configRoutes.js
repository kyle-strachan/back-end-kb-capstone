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
router.get("/locations", authMiddleware, attachUser, getLocations);
router.post("/locations", authMiddleware, attachUser, newLocation);
router.put("/locations", authMiddleware, attachUser, editLocations);

// Config system categories
router.get(
  "/system-categories",
  authMiddleware,
  attachUser,
  getSystemCategories
);
router.post(
  "/system-categories",
  authMiddleware,
  attachUser,
  newSystemCategory
);
router.put(
  "/system-categories",
  authMiddleware,
  attachUser,
  editSystemCategory
);

// Config system applications
router.get(
  "/system-applications",
  authMiddleware,
  attachUser,
  getSystemApplications
);
router.post(
  "/system-applications",
  authMiddleware,
  attachUser,
  newSystemApplication
);
router.put(
  "/system-applications/:id",
  authMiddleware,
  attachUser,
  editSystemApplication
);

// Config departments
router.get("/departments", authMiddleware, attachUser, getDepartments);
router.post("/departments", authMiddleware, attachUser, newDepartment);
router.put(
  "/departments",
  authMiddleware,
  attachUser,
  authMiddleware,
  attachUser,
  editDepartments
);

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
router.get("/business-roles", authMiddleware, attachUser, getBusinessRoles);
router.post("/business-roles", authMiddleware, attachUser, newBusinessRole);
router.patch(
  "/business-roles/:id",
  authMiddleware,
  attachUser,
  editBusinessRole
);

// Config platform roles
router.get("/platform-roles", authMiddleware, attachUser, getPlatformRoles);
router.post("/platform-roles", authMiddleware, attachUser, newPlatformRole);
router.patch(
  "/platform-roles/:id",
  authMiddleware,
  attachUser,
  editPlatformRole
);

// Config permissions
router.get("/permissions", authMiddleware, attachUser, getPermissions);

export default router;
