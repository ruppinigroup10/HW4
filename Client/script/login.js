$(document).ready(() => {
  // Set dynamic home link
  $(".home-link").attr("href", config.getAssetUrl("Pages/index.html"));
});

//////////////////////////////////
// Password toggle functionality//
//////////////////////////////////

$(".password-toggle").click(function () {
  const passwordField = $(this).siblings("input");
  if (passwordField.attr("type") === "password") {
    passwordField.attr("type", "text");
    $(this).removeClass("fa-eye").addClass("fa-eye-slash");
  } else {
    passwordField.attr("type", "password");
    $(this).removeClass("fa-eye-slash").addClass("fa-eye");
  }
});

////////////////////////////////
// Tab switching functionality//
////////////////////////////////

$(".tab-button").click(function () {
  $(".tab-button").removeClass("active");
  $(this).addClass("active");
  const formId = $(this).data("form");
  $(".form_con").hide();
  $(`#${formId}`).fadeIn();
});

// Show login by default
$('.tab-button[data-form="login"]').click();

////////////////////////
// Login functionality//
////////////////////////

$("#login").submit(function () {
  const user = {
    email: $("#log_email").val(),
    password: $("#log_password").val(),
  };

  //const api = "https://proj.ruppin.ac.il/igroup10/test2/tar1/api/Users/Login";
  //const api = `https://localhost:${PORT_BU}/api/Users/Login`;
  const api = config.getApiUrl("Users/Login");
  console.log("Attempting login with:", user);
  console.log("api:", api);

  ajaxCall("POST", api, JSON.stringify(user), lscb, lecb);
  return false;
});

function lscb(result) {
  console.log("Login success:", result);

  // Check isActive status
  if (!result.user.isActive) {
    Swal.fire({
      title: "Error!",
      text: "Account is deactivated",
      icon: "error",
      confirmButtonText: "OK",
    });
    return;
  }

  // Store sensitive info separately
  localStorage.setItem(
    "userCredentials",
    JSON.stringify({
      email: result.user.email,
      password: $("#log_password").val(),
    })
  );

  const isAdmin = result.user.email === "admin@admin.com";

  // Store display info without password
  localStorage.setItem(
    "user",
    JSON.stringify({
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      isActive: result.user.isActive,
      isAdmin: isAdmin,
      isLoggedIn: true,
    })
  );

  Swal.fire({
    title: "Success!",
    text: result.message || "Logged in successfully",
    icon: "success",
    timer: 1500,
    showConfirmButton: false,
  }).then(() => {
    window.location.replace(config.getAssetUrl("Pages/index.html"));
    // window.location.replace(
    //   "https://proj.ruppin.ac.il/igroup10/test2/tar3/Pages/index.html"
    // );
    // window.location.replace(
    //   "/Pages/index.html"
    // );
  });
}

function lecb(err) {
  console.log("Login error:", err);

  Swal.fire({
    title: "Error!",
    text: err.responseJSON?.message || "Login failed",
    icon: "error",
    confirmButtonText: "OK",
  });
}

///////////////////////////
// Register functionality//
///////////////////////////

$("#Register").submit(function () {
  //alert("in register submit");
  const user = {
    name: $("#reg_name").val(),
    email: $("#reg_email").val(),
    password: $("#reg_password").val(),
  };

  // const api =
  //   "https://proj.ruppin.ac.il/igroup10/test2/tar1/api/Users/Register";
  // const api =
  //   `https://localhost:${PORT_BU}/api/Users/Register`;
  const api = config.getApiUrl("Users/Register");
  console.log("Sending registration data:", user);

  ajaxCall("POST", api, JSON.stringify(user), rscb, recb);
  return false;
});

function rscb(result) {
  console.log("Register success:", result);
  // Store sensitive info separately
  localStorage.setItem(
    "userCredentials",
    JSON.stringify({
      email: result.user.email,
      password: $("#reg_password").val(),
    })
  );

  // Store display info without password
  localStorage.setItem(
    "user",
    JSON.stringify({
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      isLoggedIn: true,
    })
  );

  Swal.fire({
    title: "Success!",
    text: result.message || "Registered successfully",
    icon: "success",
    timer: 1500,
    showConfirmButton: false,
  }).then(() => {
    window.location.replace(config.getAssetUrl("Pages/index.html"));
    // window.location.replace(
    //   "https://proj.ruppin.ac.il/igroup10/test2/tar3/Pages/index.html"
    // );
    // window.location.replace(
    //   "/Pages/index.html"
    // );
  });
}

function recb(err) {
  console.log("Registration error:", err);

  Swal.fire({
    title: "Error!",
    text: err.responseJSON?.message || "Registration failed",
    icon: "error",
    confirmButtonText: "Try Again",
  });
}
