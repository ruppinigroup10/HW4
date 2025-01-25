$(document).ready(() => {
  // Check if user is logged in
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.replace(config.getAssetUrl("Pages/login.html"));
    // window.location.replace(
    //   "https://proj.ruppin.ac.il/igroup10/test2/tar3/Pages/login.html"
    // );
    // window.location.replace("/Pages/login.html");
    return;
  }
  //homelink
  $(".home-link").attr("href", config.getAssetUrl("Pages/index.html"));

  // Populate form with current user data
  $("#name").val(user.name);
  $("#email").val(user.email);

  // Initialize password state
  let isPasswordChanged = false;
  const originalPassword = user.password || "";

  // Set initial password values
  $("#password").attr("placeholder", "Enter password").val("");
  $("#confirmPassword").attr("placeholder", "Confirm password").val("");

  // Handle password visibility toggle
  $(".password-toggle").click(function (e) {
    e.preventDefault();
    const passwordInput = $(this).siblings("input");
    const icon = $(this);

    if (passwordInput.attr("type") === "password") {
      passwordInput.attr("type", "text");
      icon.removeClass("fa-eye").addClass("fa-eye-slash");
    } else {
      passwordInput.attr("type", "password");
      icon.removeClass("fa-eye-slash").addClass("fa-eye");
    }
  });

  // Handle password field focus
  $("#password, #confirmPassword").focus(function () {
    if ($(this).val() === "") {
      $(this).attr("type", "password");
    }
  });

  // Handle password field blur
  $("#password, #confirmPassword").blur(function () {
    if ($(this).val() === "") {
      $(this).attr("type", "password");
      $(this)
        .siblings(".password-toggle")
        .removeClass("fa-eye-slash")
        .addClass("fa-eye");
    }
  });

  // Track password changes
  $("#password, #confirmPassword").on("input", function () {
    const newValue = $(this).val();
    isPasswordChanged = newValue !== "" && newValue !== originalPassword;
  });

  // Handle form submission
  $("#editProfileForm").submit(function (e) {
    e.preventDefault();

    const name = $("#name").val().trim();
    const email = $("#email").val().trim();
    const password = $("#password").val();
    const confirmPassword = $("#confirmPassword").val();

    // Validation
    if (!name || !email) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Name and email are required",
      });
      return;
    }

    // Email validation
    const emailPattern = /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/;
    if (!emailPattern.test(email)) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please enter a valid email address",
      });
      return;
    }

    // Password validation if changed
    if (isPasswordChanged) {
      const passwordPattern = /^[A-Z0-9]+$/;
      if (!passwordPattern.test(password)) {
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: "Password must contain only uppercase letters and numbers",
        });
        return;
      }
    }

    if (password !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Password Error",
        text: "Passwords do not match",
      });
      return;
    }

    const updateData = {
      id: user.id,
      name: name,
      email: email,
      password: isPasswordChanged ? password : originalPassword,
    };

    // const api =
    //   "https://proj.ruppin.ac.il/igroup10/test2/tar1/api/Users/UpdateProfile";
    // const api =`https://localhost:${PORT_BU}/api/Users/UpdateProfile"`;
    const api = config.getApiUrl("Users/UpdateProfile");
    ajaxCall(
      "PUT",
      api,
      JSON.stringify(updateData),
      updateSuccessCB,
      updateErrorCB
    );
  });
});

function updateSuccessCB(result) {
  const user = JSON.parse(localStorage.getItem("user"));
  const updatedUser = {
    ...user,
    name: result.user.name,
    email: result.user.email,
    password: result.user.password,
  };
  localStorage.setItem("user", JSON.stringify(updatedUser));

  Swal.fire({
    icon: "success",
    title: "Success!",
    text: "Profile updated successfully",
    timer: 1500,
    showConfirmButton: false,
  }).then(() => {
    window.location.replace(config.getAssetUrl("Pages/index.html"));
  });
  //   window.location.href =
  //     "https://proj.ruppin.ac.il/igroup10/test2/tar3/Pages/index.html";
  // });
  //   window.location.href ="/Pages/index.html";});
}

function updateErrorCB(error) {
  console.error("Update failed:", error);
  Swal.fire({
    icon: "error",
    title: "Update Failed",
    text: error.responseJSON?.message || "Failed to update profile",
  });
}
