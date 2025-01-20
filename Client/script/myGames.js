/////////////////////////////////////////////////
// Helper function to check user authentication//
/////////////////////////////////////////////////

function checkUserAuth() {
  const user = JSON.parse(localStorage.getItem("user"));
  console.log("Current user:", user);
  return user && user.id && user.isLoggedIn;
}

let allGames = []; // Store all games for filtering

////////////////////////////////
// Function to fetch all games//
////////////////////////////////

function getMyGames() {
  if (!checkUserAuth()) {
    console.log("User auth failed in getMyGames");
    window.location.replace(config.getAssetUrl("Pages/login.html"));
    // window.location.replace(
    //   "https://proj.ruppin.ac.il/igroup10/test2/tar3/Pages/login.html"
    // );
    // window.location.replace(
    //   "/Pages/login.html"
    // );
    return;
  }
  const user = JSON.parse(localStorage.getItem("user"));
  console.log("Getting games for user ID:", user.id);

  //const api = `https://proj.ruppin.ac.il/igroup10/test2/tar1/api/Games/GetGamesByUserId/userID/${user.id}`;
  //const api = `https://localhost:${Port_BU}/api/Games/GetGamesByUserId/userID/${user.id}`;
  const api = config.getApiUrl(`Games/GetGamesByUserId/userID/${user.id}`);
  console.log("Making API call to:", api);
  ajaxCall("GET", api, "", getSCB, getECB);
}

// Success callback for AJAX calls
function getSCB(gamesData) {
  console.log("Games data received:", gamesData);
  if (gamesData && Array.isArray(gamesData)) {
    // Add validation
    console.log(`Processing ${gamesData.length} games for user`);
    allGames = [...gamesData]; // Make a copy to ensure data integrity
    renderGames(allGames);
  } else {
    console.error("Invalid games data received");
    allGames = []; // Reset allGames if invalid data
    renderGames([]); // Render empty state
    Swal.fire({
      title: "Error!",
      text: "Failed to load games data correctly",
      icon: "error",
    });
  }
}

// Error callback for AJAX calls
function getECB(err) {
  console.error("Error occurred:", err);
  Swal.fire({
    title: "Error!",
    text: "Failed to load games",
    icon: "error",
  });
}

///////////////////////////////////////////////
// Main renderGames function to display games//
///////////////////////////////////////////////

function renderGames(games) {
  if (!Array.isArray(games)) {
    console.error("Invalid games data passed to renderGames");
    return;
  }

  const mainDiv = document.getElementById("main");
  if (!mainDiv) {
    console.error("Main div not found");
    return;
  }

  console.log(`Rendering ${games.length} games`);
  mainDiv.innerHTML = ""; // Clear current content

  if (games.length === 0) {
    mainDiv.innerHTML = '<div class="no-games">No games found</div>';
    return;
  }

  games.forEach((game) => {
    if (!game || !game.AppID) {
      // Validate each game object
      console.error("Invalid game object:", game);
      return;
    }

    const gameDiv = document.createElement("div");
    gameDiv.classList.add("card");

    gameDiv.innerHTML = `
            <img src="${game.HeaderImage || "placeholder-image.jpg"}" alt="${
      game.Name || "Game"
    }">
            <h3>${game.Name || "Untitled Game"}</h3>
            <h4>Release Date: ${
              new Date(game.ReleaseDate).toISOString().split("T")[0] ||
              "Release date not available"
            }</h4>
            <h4>Developer: ${game.Publisher || "Developer unknown"}</h4>
            <h4>Price: ${game.Price ? game.Price + "$" : "Free"}</h4>
            <h4>Rank: ${game.ScoreRank || 0}</h4>
            <button type="button" onclick="deleteGame(${
              game.AppID
            })">Delete Game</button>
        `;

    mainDiv.appendChild(gameDiv);
  });
}

//////////////////////////////
// Function to delete a game//
//////////////////////////////

function deleteGame(gameId) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !user.id) {
    console.log("User not logged in");
    window.location.replace(config.getAssetUrl("Pages/login.html"));
    // window.location.replace(
    //   "https://proj.ruppin.ac.il/igroup10/test2/tar3/Pages/login.html"
    // );
    // window.location.replace(
    //   "/Pages/login.html"
    // );
    return;
  }

  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      console.log("Initiating delete for game:", gameId);

      //const api = `https://proj.ruppin.ac.il/igroup10/test2/tar1/api/Games/${user.id}/${gameId}`;
      //const api = `https://localhost:${Port_BU}/api/Games/${user.id}/${gameId}`;
      const api = config.getApiUrl(`Games/${user.id}/${gameId}`);
      ajaxCall("DELETE", api, null, deleteSCB, deleteECB);
    }
  });

  function deleteSCB(response) {
    if (response.message) {
      Swal.fire({
        title: "Deleted!",
        text: response.message,
        icon: "success",
      });
      // Update allGames by removing the deleted game
      if (Array.isArray(allGames)) {
        allGames = allGames.filter((game) => game.AppID !== gameId);
        renderGames(allGames);
      }
    }
  }

  function deleteECB(error) {
    console.error("Delete failed:", error);
    let errorMessage = "Failed to delete game";

    if (error.responseJSON && error.responseJSON.message) {
      errorMessage = error.responseJSON.message;
    } else if (error.status === 500) {
      errorMessage = "Server error occurred while deleting the game";
    }

    Swal.fire({
      title: "Error!",
      text: errorMessage,
      icon: "error",
    });
  }
}

$(document).ready(() => {
  ////////////////////////////////////////////////
  // Check if user is logged in and display info//
  ////////////////////////////////////////////////

  //backups

  //<a href="/Pages/index.html" class="home-link">
  //<a href="https://proj.ruppin.ac.il/igroup10/test2/tar3/Pages/index.html" class="home-link">
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.isLoggedIn) {
    $("#userInfo").html(`
            <div style="display: flex; justify-content: center; padding: 10px;">
          <span class="home-link" style="background: rgba(255, 255, 255, 0.1);">
          Welcome, ${user.name || user.email}
          </span>
          </div>
            <a href="${config.getAssetUrl(
              "Pages/index.html"
            )}" class="home-link">
            <i class="fas fa-gamepad"></i>Home
          </a>
            <a href="#" onclick="logout()" class="home-link">
              <i class="fas fa-sign-out-alt"></i>Logout
            </a>
        `);

    getMyGames();
  } else {
    window.location.replace(config.getAssetUrl("Pages/login.html"));
    // window.location.replace(
    //   "https://proj.ruppin.ac.il/igroup10/test2/tar3/Pages/login.html"
    // );
    // window.location.replace(
    //   "/Pages/login.html"
    // );
  }
});

////////////////////
// Logout function//
////////////////////

function logout() {
  localStorage.removeItem("user");
  localStorage.removeItem("userCredentials"); // Remove sensitive info too
  Swal.fire({
    title: "Logged Out!",
    text: "You have been successfully logged out",
    icon: "success",
    timer: 1500,
    showConfirmButton: false,
  }).then(() => {
    window.location.replace(config.getAssetUrl("Pages/login.html"));
    // window.location.replace(
    //   "https://proj.ruppin.ac.il/igroup10/test2/tar3/Pages/login.html"
    // );
    // window.location.replace(
    //   "/Pages/login.html"
    // );
  });
}

//////////////////////////////////////
// Function to filter games by price//
//////////////////////////////////////

function filterByPrice() {
  if (!checkUserAuth()) {
    console.log("User auth failed in filterByPrice");
    window.location.replace(config.getAssetUrl("Pages/login.html"));
    // window.location.replace(
    //   "https://proj.ruppin.ac.il/igroup10/test2/tar3/Pages/login.html"
    // );
    // window.location.replace(
    //   "/Pages/login.html"
    // );
    return;
  }

  const minPriceInput = document.getElementById("priceFilter");
  const minPrice = minPriceInput.value;
  console.log("Filtering by price:", minPrice);

  if (!minPrice && minPrice !== "0") {
    console.warn("No minimum price specified");
    Swal.fire({
      title: "No value?",
      text: "Please enter a minimum price to filter games",
      icon: "question",
    });
    return;
  }

  const rankInput = document.getElementById("rankFilter");
  const rankValue = rankInput.value;

  let filteredGames;

  // If we have both filters
  if (rankValue) {
    console.log("Filtering by both price and rank");
    filteredGames = allGames.filter(
      (game) =>
        game.Price >= parseFloat(minPrice) &&
        game.ScoreRank >= parseInt(rankValue)
    );
  } else {
    // Only filter by price
    console.log("Filtering only by price");
    filteredGames = allGames.filter(
      (game) => game.Price >= parseFloat(minPrice)
    );
  }

  console.log("Filtered games:", filteredGames);
  renderGames(filteredGames);
}

/////////////////////////////////////
// Function to filter games by rank//
/////////////////////////////////////

function filterByRank() {
  if (!checkUserAuth()) {
    console.log("User auth failed in filterByRank");
    window.location.replace(config.getAssetUrl("Pages/login.html"));
    // window.location.replace(
    //   "https://proj.ruppin.ac.il/igroup10/test2/tar3/Pages/login.html"
    // );
    // window.location.replace(
    //   "/Pages/login.html"
    // );
    return;
  }

  const minRankInput = document.getElementById("rankFilter");
  const minRank = minRankInput.value;
  console.log("Filtering by rank:", minRank);

  if (!minRank && minRank !== "0") {
    console.warn("No minimum rank specified");
    Swal.fire({
      title: "No value?",
      text: "Please enter a minimum rank score to filter games",
      icon: "question",
    });
    return;
  }

  const priceInput = document.getElementById("priceFilter");
  const priceValue = priceInput.value;

  let filteredGames;

  // If we have both filters
  if (priceValue) {
    console.log("Filtering by both price and rank");
    filteredGames = allGames.filter(
      (game) =>
        game.ScoreRank >= parseInt(minRank) &&
        game.Price >= parseFloat(priceValue)
    );
  } else {
    // Only filter by rank
    console.log("Filtering only by rank");
    filteredGames = allGames.filter(
      (game) => game.ScoreRank >= parseInt(minRank)
    );
  }

  console.log("Filtered games:", filteredGames);
  renderGames(filteredGames);
}
