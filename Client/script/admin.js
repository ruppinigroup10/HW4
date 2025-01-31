$(document).ready(function () {
  ////////////////////
  // Check if admin //
  ////////////////////
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !user.isAdmin) {
    window.location.replace("/Pages/login.html");
    return;
  }

  // Initialize DataTables
  initializeTables();

  // Tab switching
  $(".tab-button").click(function () {
    $(".tab-button").removeClass("active");
    $(".tab-content").removeClass("active");

    $(this).addClass("active");
    $(`#${$(this).data("tab")}`).addClass("active");
  });
});

function initializeTables() {
  // Initialize Users Table
  const usersTable = $("#usersTable").DataTable({
    destroy: true,
    ajax: {
      url: config.getApiUrl("Users/getUserData"),
      dataSrc: "",
    },
    columns: [
      { data: "id" },
      { data: "name" },
      { data: "numOfGamesBought" },
      {
        data: "amountSpent",
        render: function (data) {
          return `$${data.toFixed(2)}`;
        },
      },
      {
        data: null,
        render: function (data) {
          const status = data.isActive ? "Deactivate" : "Activate";
          const btnClass = data.isActive ? "deactivate-btn" : "activate-btn";
          return `<button class="${btnClass}" onclick="toggleUserStatus(${
            data.id
          }, ${data.isActive ? 0 : 1})">${status}</button>`;
        },
      },
    ],
    dom: "Bfrtip",
    buttons: ["copy", "excel", "pdf"],
  });

  // Initialize Games Table
  const gamesTable = $("#gamesTable").DataTable({
    destroy: true,
    ajax: {
      url: config.getApiUrl("Games/GetGamesData"),
      dataSrc: "",
      error: function (xhr, error, thrown) {
        console.error("Ajax error:", xhr.responseText);
        Swal.fire({
          title: "Error!",
          text: "Failed to load games data: " + xhr.responseText,
          icon: "error",
        });
      },
    },
    columns: [
      { data: "appID" },
      { data: "name" },
      { data: "numberOfPurchases" },
      {
        data: "totalAmountPaid",
        render: function (data) {
          return `$${data.toFixed(2)}`;
        },
      },
    ],
    dom: "Bfrtip",
    buttons: ["copy", "excel", "pdf"],
  });
}

////////////////////////
// Toggle user status //
////////////////////////

function toggleUserStatus(userId, newStatus) {
  console.log(`Debug - userId: ${userId}, newStatus: ${newStatus}`);

  const api = config.getApiUrl(
    `Users/IsActiveChange?id=${userId}&isActive=${newStatus}`
  );

  console.log("API URL:", api);

  $.ajax({
    url: api,
    type: "PUT",
    contentType: "application/json",
    success: function (response) {
      console.log("API URL:", api);
      $("#usersTable").DataTable().ajax.reload();
      Swal.fire({
        title: "Success!",
        text: "User status updated successfully",
        icon: "success",
      });
    },
    error: function (xhr) {
      console.error("Error details:", xhr.responseText);
      Swal.fire({
        title: "Error!",
        text: "Failed to update user status",
        icon: "error",
      });
    },
  });
}

///////////////
// User info //
///////////////

$(document).ready(function () {
  const user = JSON.parse(localStorage.getItem("user"));

  $("#userInfo").html(`
    <div style="display: flex; justify-content: center; padding: 10px">
      <span class="home-link" style="background: rgba(255, 255, 255, 0.1)">
        Welcome, ${user?.name || "Admin"}
      </span>
    </div>
    <a href=${config.getAssetUrl("Pages/index.html")} class="home-link">
      <i class="fas fa-gamepad"></i>Home
    </a>
    <a href="#" onclick="logout()" class="home-link">
      <i class="fas fa-sign-out-alt"></i>Logout
    </a>
  `);
});

function logout() {
  window.utils.logout();
}
