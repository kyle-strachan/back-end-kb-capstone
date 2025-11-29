export function cleanUser(user) {
  //DETAIL UI FLAGS

  return {
    _id: user._id,
    fullName: user.fullName,
    username: user.username,
    department: user.department,
    location: user.location,
    passwordMustChange: user.passwordMustChange,
    uiFlags: { enableDepartments: false, enableAccessRequests: true },
  };
}
