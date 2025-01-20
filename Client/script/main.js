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
    gameDiv.classList.add("card");

    gameDiv.innerHTML += `<img src="${game.HeaderImage}">`;
    gameDiv.innerHTML += `<h3>${game.Name}</h3>`;
    gameDiv.innerHTML += `<h4>${game.ReleaseDate}</h4>`;
    gameDiv.innerHTML += `<h4>${game.Publisher}</h4>`;
    gameDiv.innerHTML += `<h4>${game.Price}$</h4>`;
    gameDiv.innerHTML += `<h4>Rank: ${game.ScoreRank}</h4>`;
    gameDiv.innerHTML += `<button type="button" id="${game.AppID}">Add to MyGAMES</button>`;

    mainD.appendChild(gameDiv);
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
  if (e.target.tagName === "BUTTON") {
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
  $("#userLinks").html(`
    
          
          <a href="${config.getAssetUrl(
            "Pages/MyGames.html"
          )}" class="home-link">
            <i class="fas fa-gamepad"></i>My Games
          </a>
          <a href="${config.getAssetUrl(
            "Pages/editProfile.html"
          )}" class="home-link">
            <i class="fas fa-user-edit"></i>Edit Profile
          </a>
          <a href="#" onclick="logout()" class="home-link">
            <i class="fas fa-sign-out-alt"></i>Logout
          </a>
        `);
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

/////////////////////
// Logout function //
/////////////////////
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
  });
  //backups
  //window.location.replace("https://proj.ruppin.ac.il/igroup10/test2/tar3/Pages/login.html")});
  //window.location.replace("/Pages/login.html")});
}
