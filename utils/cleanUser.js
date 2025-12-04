import { RolePermissions } from "./permissions.js";

export function cleanUser(user) {
  // Get permissions from roles
  const userPermissions = user.roles.flatMap(
    (role) => RolePermissions[role] || []
  );
  const isSuperAdmin = user.isSuperAdmin;

  // Set all UI flags to false by default

  // Config UI
  let enableDepartments = false;
  let enableLocations = false;
  let enableDocsCategories = false;
  let enableSystems = false;

  if (userPermissions.includes("departments.CanManage") || isSuperAdmin) {
    enableDepartments = true;
  }
  if (userPermissions.includes("locations.CanManage") || isSuperAdmin) {
    enableLocations = true;
  }
  if (userPermissions.includes("docsCategories.CanManage") || isSuperAdmin) {
    enableDocsCategories = true;
  }
  if (userPermissions.includes("system.CanManage") || isSuperAdmin) {
    enableSystems = true;
  }

  // User access requests UI
  let enableAccessRequests = false;
  let enableUsers = false;
  let enableUserEdit = false;
  let enableUserCreate = false;

  if (
    userPermissions.includes("accessRequests.CanViewCreate") ||
    isSuperAdmin
  ) {
    enableAccessRequests = true;
  }
  if (userPermissions.includes("users.CanView") || isSuperAdmin) {
    enableUsers = true;
  }
  if (userPermissions.includes("users.CanEdit") || isSuperAdmin) {
    enableUserEdit = true;
  }
  if (userPermissions.includes("users.CanRegister") || isSuperAdmin) {
    enableUserCreate = true;
  }

  // Docs UI
  let enableDocs;

  if (userPermissions.includes("docs.CanEdit") || isSuperAdmin) {
    enableDocs = true;
  }

  // User control
  let enableTerminate = false;
  if (userPermissions.includes("users.CanTerminate") || isSuperAdmin) {
    enableTerminate = true;
  }

  return {
    _id: user._id,
    fullName: user.fullName,
    username: user.username,
    department: user.department,
    location: user.location,
    passwordMustChange: user.passwordMustChange,
    uiFlags: {
      enableDepartments,
      enableLocations,
      enableDocsCategories,
      enableSystems,
      enableAccessRequests,
      enableUsers,
      enableDocs,
      enableUserEdit,
      enableUserCreate,
      enableTerminate,
    },
  };
}
