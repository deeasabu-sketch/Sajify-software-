exports.isAuthenticated = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.redirect("/login");
    }

    next();
};

// ===============================
// Admin Access
// ===============================
exports.isAdmin = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.redirect("/login");
  }

  const { role } = req.session.user;

  if (role !== "admin" && role !== "subadmin") {
    return res.status(403).send("Access Denied");
  }

  next();
};
// ===============================
// Main Admin Only
// ===============================
exports.isMainAdmin = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.redirect("/login");
  }

  if (
    req.session.user.role !== "admin" ||
    req.session.user.isMainAdmin !== true
  ) {
    return res.status(403).send("Main Admin Access Required");
  }

  next();
};
// ===============================
// Admin Permission Middleware
// ===============================
exports.hasPermission = (permission) => {
  return (req, res, next) => {

    // Not logged in
    if (!req.session || !req.session.user) {
      return res.redirect("/login");
    }

    const user = req.session.user;

    // Main Admin has full access
    if (
      user.role === "admin" &&
      user.isMainAdmin === true
    ) {
      return next();
    }

    // Only Sub Admin can use permission system
    if (user.role !== "subadmin") {
      return res.status(403).send("Access Denied");
    }

    // Check permission
    if (
      !Array.isArray(user.permissions) ||
      !user.permissions.includes(permission)
    ) {
      return res.status(403).send(
        "You do not have permission to access this section."
      );
    }

    next();
  };
};