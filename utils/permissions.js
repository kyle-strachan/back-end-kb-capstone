export const RolePermissions = {
  SystemAdmin: [
    "systems.CanManage",
    "departments.CanManage",
    "locations.CanManage",
    "docsCategories.CanManageAll",
    "docsCategories.CanManageOwn",
    "docs.CanCreate",
    "docs.CanEdit",
    "docs.CanView",
  ],
  HR: [
    "users.CanRegister",
    "users.CanTerminate",
    "users.CanEdit",
    "docs.CanViewOwnDepartment",
  ],
  DepartmentManager: [
    "users.CanView",
    "accessRequests.CanViewCreate",
    "docsCategories.CanManage",
    "docs.CanCreate",
    "docs.CanEdit",
    "docs.CanView",
  ],
  DepartmentSupervisor: ["docs.CanCreate", "docs.CanEdit", "docs.CanView"],
  User: ["docs.CanViewOwnDepartment"],
};
