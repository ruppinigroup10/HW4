$(document).ready(function () {
  // Check if admin
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
      //   {
      //     data: "isActive",
      //     render: function (data) {
      //       return data
      //         ? '<span class="active">Active</span>'
      //         : '<span class="inactive">Inactive</span>';
      //     },
      //   },
      {
        data: null,
        render: function (data) {
          const status = data.isActive ? "Deactivate" : "Activate";
          return `<button onclick="toggleUserStatus(${data.id}, ${
            data.isActive ? 0 : 1
          })">${status}</button>`;
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

function toggleUserStatus(userId, newStatus) {
  //   const data = {
  //     id: userId,
  //     isActive: newStatus,
  //   };

  console.log(`Debug - userId: ${userId}, newStatus: ${newStatus}`);

  const api = config.getApiUrl(
    `Users/IsActiveChange?id=${userId}&isActive=${newStatus}`
  );

  console.log("API URL:", api);

  $.ajax({
    url: api,
    type: "PUT",
    //data: JSON.stringify(data),

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
