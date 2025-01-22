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

  ///////////////////////////////////////////////////////////
  // Logout function- combined logout for main and mygames //
  ///////////////////////////////////////////////////////////

  logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("userCredentials");
    Swal.fire({
      title: "Logged Out!",
      text: "You have been successfully logged out",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    }).then(() => {
      window.location.replace(config.getAssetUrl("Pages/login.html"));
    });

    //backups
    //window.location.replace("https://proj.ruppin.ac.il/igroup10/test2/tar3/Pages/login.html")});
    //window.location.replace("/Pages/login.html")});
  },

  // Test function
  testUtilities() {
    console.log("Utilities module loaded successfully");
    return true;
  },
};

export default utils;
