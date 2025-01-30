let mainD = document.getElementById("main");

/////////////////////////////////////////
// Function to get and render all games//
/////////////////////////////////////////

function getAllGames() {
  console.log("in getAllGames");
  // const api =
  //   "https://proj.ruppin.ac.il/igroup10/test2/tar1/api/Games/GetAllGames";
  // const api =
  //   `https://localhost:${Port_BU}/api/Games/GetAllGames`;
  const api = config.getApiUrl("Games/GetAllGames");
  console.log("api:", api);
  ajaxCall("GET", api, "", renderAllGames, errorCB);
  console.log("after ajax");
}

/////////////////////////////
// Render games as success //
/////////////////////////////

function renderAllGames(games) {
  //console.log("games recived:", games);
  mainD.innerHTML = ""; // Clear existing content
  //console.log("Number of games to render:", games.length);
  games.forEach((game) => {
    //console.log("Rendering game:", game);
    const gameDiv = document.createElement("div");

    const safeDescription = game.Description
      ? JSON.stringify(game.Description) // This properly escapes the string
      : '""';

    gameDiv.classList.add("card");

    gameDiv.innerHTML = `
      <img src="${game.HeaderImage}">
      <h3>${game.Name}</h3>
      <h4>${game.ReleaseDate}</h4>
      <h4>${game.Publisher}</h4>
      <h4>${game.Price}$</h4>
      <h4>Rank: ${game.ScoreRank}</h4>
      <h4>Genre: <span id="genre-${game.AppID}">${
      game.Genre || "Not classified"
    }</span></h4>
      <button type="button" class="add-game" id="${
        game.AppID
      }">Add to MyGAMES</button>
      <button type="button" class="classify-btn" data-gameid="${
        game.AppID
      }" data-description="${game.Description || ""}">
        Classify Genre
      </button>`;

    mainD.appendChild(gameDiv);

    const classifyBtn = gameDiv.querySelector(".classify-btn");
    classifyBtn.addEventListener("click", () => {
      classifyGameGenre(game.AppID, game.Description || "");
    });
  });

  document.querySelectorAll(".classify-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const gameId = this.dataset.gameid;
      const description = this.dataset.description;
      classifyGameGenre(gameId, description);
    });
  });
}

function errorCB(error) {
  console.log("in error");
  console.error("Error getting games:", error);
  mainD.innerHTML = "<p>Error loading games. Please try again later.</p>";
}

/////////////////////////
// Convert date format //
/////////////////////////

function convertDateFormat(dateStr) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`; // DateOnly in C#
}

/////////////////////////////////////////////////////////////
// Add event listener to add game button - add to my games //
/////////////////////////////////////////////////////////////

mainD.addEventListener("click", (e) => {
  if (e.target.classList.contains("add-game")) {
    const gameId = e.target.id;
    const gameCard = e.target.closest(".card");
    if (!gameCard) return;

    const GameToPost = {
      appID: parseInt(gameId),
      name: gameCard.querySelector("h3").textContent,
      releaseDate: convertDateFormat(
        gameCard.querySelectorAll("h4")[0].textContent
      ),
      price: parseFloat(
        gameCard.querySelectorAll("h4")[2].textContent.replace("$", "")
      ),
      publisher: gameCard.querySelectorAll("h4")[1].textContent,
      headerImage: gameCard.querySelector("img").src,
    };

    const UserToPost = JSON.parse(localStorage.getItem("user"));
    if (!UserToPost) {
      alert("Please log in first");
      return;
    }

    // Check if user is logged in and active
    if (!utils.checkUserAccess()) return;

    console.log("Sending data:", { game: GameToPost, user: UserToPost });

    //const api = "https://proj.ruppin.ac.il/igroup10/test2/tar1/api/Games";
    //const api = `https://localhost:${PORT_BU}/api/Games`;
    const api = config.getApiUrl("Games");
    const GameUser = { game: GameToPost, user: UserToPost };

    ajaxCall("POST", api, JSON.stringify(GameUser), postSCB, postECB);
  }

  function postSCB(result) {
    console.log("Success:", result);
    Swal.fire({
      title: "All done!",
      text: "Game added Successfully",
      icon: "success",
    });
  }

  function postECB(error) {
    console.error("Failed:", error);
    if (error.responseJSON) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.responseJSON.message,
      });
    } else {
      alert(error.responseText);
    }
  }
});

$(document).ready(() => {
  console.log("enter to func");
  getAllGames();
});

////////////////////////////////////////////////
// Check if user is logged in and display info//
////////////////////////////////////////////////

//backups
//<a href="https://proj.ruppin.ac.il/igroup10/test2/tar3/Pages/MyGames.html" class="home-link">
// <a href="/Pages/MyGames.html" class="home-link">
//<a href="https://proj.ruppin.ac.il/igroup10/test2/tar3/Pages/editProfile.html" class="home-link">
//<a href="/Pages/editProfile.html" class="home-link"></a>
const user = JSON.parse(localStorage.getItem("user"));
if (user && user.isLoggedIn) {
  // Base links string
  let links = `<a href="${config.getAssetUrl(
    "Pages/MyGames.html"
  )}" class="home-link">
                <i class="fas fa-gamepad"></i>My Games
              </a>
              <a href="${config.getAssetUrl(
                "Pages/editProfile.html"
              )}" class="home-link">
                <i class="fas fa-user-edit"></i>Edit Profile
              </a>
              <a href="${config.getAssetUrl(
                "Pages/bonus.html"
              )}" class="home-link">
                <i class="fas fa-user-edit"></i>Bonus
              </a>`;

  // Check for admin and add admin link
  if (user.email === "admin@admin.com") {
    links += `<a href="${config.getAssetUrl(
      "Pages/adminPage.html"
    )}" class="home-link">
                <i class="fas fa-user-shield"></i>Admin Panel
              </a>`;
  }

  // logout link
  links += `<a href="#" onclick="logout()" class="home-link">
              <i class="fas fa-sign-out-alt"></i>Logout
            </a>`;

  $("#userLinks").html(links);
  $("#userName").html(`
    
          <div style="display: flex; justify-content: center; padding: 10px;">
          <span class="home-link" style="background: rgba(255, 255, 255, 0.1);">
          Welcome, ${user.name || user.email}
          </span>
          </div>
        `);
} else {
  //backups
  //<a href="https://proj.ruppin.ac.il/igroup10/test2/tar3/Pages/login.html" class="home-link">
  //<a href="/Pages/login.html" class="home-link">
  // Show login link for non-logged-in users
  $("#userInfo").html(`
          <a href="${config.getAssetUrl("Pages/login.html")}" class="home-link">
            <i class="fas fa-sign-in-alt"></i>Login
          </a>
        `);
}

function logout() {
  // Call the utility function
  window.utils.logout();
}

/////////////////////////
// Classify Game Genre //
/////////////////////////

function classifyGameGenre(gameId, description) {
  // Show loading state
  $(`#genre-${gameId}`).text("Classifying...");

  const game = {
    AppID: gameId,
    Description: description,
  };

  $.ajax({
    url: config.getApiUrl("Games/classify-genre"),
    type: "POST",
    data: JSON.stringify(game),
    contentType: "application/json",
    timeout: 30000, // 30 second timeout
    success: function (response) {
      console.log("Genre classified:", response.genre);
      $(`#genre-${gameId}`).text(response.genre);
    },
    error: function (xhr) {
      console.error("Error classifying genre:", xhr.responseText);
      $(`#genre-${gameId}`).text("Classification failed");
      // Show error to user
      Swal.fire({
        icon: "error",
        title: "Classification Failed",
        text: "The genre classification service is currently unavailable. Please try again later.",
      });
    },
  });
}
