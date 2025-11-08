import { Router } from "express";
import {
  newLocation,
  toggleLocationIsActive,
} from "../controllers/configLocationsController.js";
import {
  editSystemCategory,
  newSystemCategory,
} from "../controllers/configSystemCategoriesController.js";
import {
  newDepartment,
  toggleDepartmentIsActive,
} from "../controllers/configDepartmentsController.js";
import {
  editSystemApplication,
  newSystemApplication,
} from "../controllers/configSystemApplicationsController.js";

// import { authMiddleware } from ...
// import { noCache } from ...

const router = Router();

// Config locations
router.post("/locations", newLocation);
router.patch("/locations/:id/activate", toggleLocationIsActive(true));
router.patch("/locations/:id/deactivate", toggleLocationIsActive(false));

// Config system categories
router.post("/systemCategories", newSystemCategory);
router.patch("/systemCategories/:id", editSystemCategory);

// Config system applications
router.post("/systemApplications", newSystemApplication);
router.patch("/systemApplications/:id", editSystemApplication);

// Config departments
router.post("/departments", newDepartment);
router.patch("/departments/:id/activate", toggleDepartmentIsActive(true));
router.patch("/departments/:id/deactivate", toggleDepartmentIsActive(false));

export default router;
