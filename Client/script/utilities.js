const utils = {
  checkUserAccess() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      Swal.fire({
        title: "Error!",
        text: "Please log in first",
        icon: "error",
      });
      return false;
    }

    if (!user.isActive) {
      Swal.fire({
        title: "Account Deactivated",
        text: "Please contact support",
        icon: "error",
      });
      return false;
    }
    return true;
  },

  redirectToLogin() {
    window.location.replace(config.getAssetUrl("Pages/login.html"));
  },

  logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("userCredentials");
    Swal.fire({
      title: "Logged Out!",
      text: "You have been successfully logged out",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    }).then(() => utils.redirectToLogin());
  },
};

export default utils;
