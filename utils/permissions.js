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
  HumanResources: [
    "users.CanRegister",
    "users.CanTerminate",
    "users.CanEdit",
    "docs.CanViewOwnDepartment",
  ],
  Manager: [
    "users.CanView",
    "accessRequests.CanViewCreate",
    "docsCategories.CanManage",
    "docs.CanCreate",
    "docs.CanEdit",
    "docs.CanView",
  ],
  Supervisor: ["docs.CanCreate", "docs.CanEdit", "docs.CanView"],
  User: ["docs.CanView"],
};
