$(document).ready(function() {
    // Open the modal
    $('#signupLink').click(function() {
        $('#sign-up-modal').css('display', 'block');
    });

    // Close the modal when the close button is clicked
    $('#sign-up-modal-close').click(function() {
        $('#sign-up-modal').css('display', 'none');
    });

    // Submit event for the register form
    $("#sign-up-form").on("submit", (e) => {
        // Do not submit the form
        e.preventDefault();

        // Get the input fields
        const username = $("#sign-up-username").val().trim();
        const password = $("#sign-up-password").val().trim();
        const confirmPassword = $("#sign-up-password-confirm").val().trim();
        console.log(username, password, confirmPassword);

        // Password and confirmation does not match
        if (password != confirmPassword) {
            $("#sign-up-message").text("Passwords do not match.");
            return;
        }

        // Send a register request
        Registration.register(username, password,
            () => {
                $("#sign-up-form").get(0).reset();
                $("#sign-up-message").text("You can sign in now.");
            },
            (error) => { $("#sign-up-message").text(error); }
        );
    });

    $("#sign-in-form").on("submit", (e) => {
        // Do not submit the form
        e.preventDefault();

        // Get the input fields
        const username = $("#sign-in-username").val().trim();
        const password = $("#sign-in-password").val().trim();

        // Send a signin request
        Authentication.signin(username, password,
            () => {
                // Handle sign in
                showSignedInPage();
                Socket.connect();
            },
            (error) => { $("#sign-in-message").text(error); }
        );
    });

    // Click event for the signout button
    $("#sign-out-button").on("click", () => {
        // Send a signout request
        Authentication.signout(
            () => {
                // Handle Sign out
                showMainPage();
                Socket.disconnect();
            }
        );
    });

    $("#play-button").on("click", () => {
        console.log("Start finding player")
        showLoading();
        Socket.enterQueue();
    })

    // Show instruction upon clicking instruction button on the main page
    $("#game-instruction-button").on("click", () => {
        $("#instruction-modal").show();
    })

    // Close the instruction upon clicking x button
    $('#instruction-modal-close').click(function() {
        $('#instruction-modal').hide();
    });

    // Abort finding opponent
    $('#loading-close').click(function() {
        hideLoading();
        Socket.leaveQueue();
    });

    $("#stats-leave-button").click(() => {
        Socket.leaveGameRoom();
        showSignedInPage();
    });

    $("#stats-replay-button").click(() => {
        showReplayLoading();
        Socket.replayGame();
    });

    $("#replay-loading-close").click(() => {
        hideReplayLoading();
    });

});

function showSignedInPage() {
    $("#main-page").hide();
    $("#game-page").hide();
    $("#game-stats-modal").hide();
    hideReplayLoading();
    $("#signed-in-page").show();
}

function showMainPage() {
    $("#main-page").show();
    $("#signed-in-page").hide();
    $("#game-page").hide();
}

let loadingInterval;
let replayLoadingInterval;

function showLoading() {
    let loading = $("#loading");
    let loadingText = $("#loadingText");
    let count = 1;
    loading.show();
    function updateLoadingText() {
        // Update the text to add dots
        loadingText.text("Finding your opponent." + ".".repeat(count));
        count = (count + 1) % 3;
    }
    loadingInterval = setInterval(updateLoadingText, 500);
}

function hideLoading() {
    let loading = $("#loading");
    let loadingText = $("#loadingText");
    loading.hide();
    loadingText.text("Finding your opponent.");
    clearInterval(loadingInterval);
}

function showReplayLoading() {
    let loading = $("#replay-loading");
    let loadingText = $("#replay-loadingText");
    let count = 1;
    loading.show();
    function updateLoadingText() {
        // Update the text to add dots
        loadingText.text("Waiting for your opponent." + ".".repeat(count));
        count = (count + 1) % 3;
    }
    replayLoadingInterval = setInterval(updateLoadingText, 500);
}

function hideReplayLoading() {
    let loading = $("#replay-loading");
    let loadingText = $("#replay-loadingText");
    loading.hide();
    loadingText.text("Finding your opponent.");
    clearInterval(replayLoadingInterval);
}

function startGame() {
    console.log("Game started");

    $(function() {
        /* Get the canvas and 2D context */
        const cv = $("#game-canvas").get(0);
        const context = cv.getContext("2d");

        UI.initialize(context);

        /* Draw the cloud */
        const cloud1 = new Image();
        cloud1.src = "src/img/cloud1.png";
        const cloud2 = new Image();
        cloud2.src = "src/img/cloud2.png";


        var cloud1_x = cv.width;
        var cloud2_x = cv.width + 200;
        var cloud1Speed = 1;
        var cloud2Speed = 0.8;
        var startTime = null;

        /* Create the game loop */
        function doFrame(now) {
            // console.log('game loop')

            /* Update the sprites */
            Player.update(now);
            Desperado.update(now);
            Horses.update(now);

            if (!startTime) {
                startTime = now;
            }
            var elapsed = now - startTime;

            cloud1_x -= cloud1Speed;
            if (cloud1_x < -cloud1.width) {
                cloud1_x = cv.width;
            }

            if (elapsed > 3000) {
                cloud2_x -= cloud2Speed;
                if (cloud2_x < -cloud2.width) {
                    cloud2_x = cv.width;
                }
            }

            /* Clear the screen */
            context.clearRect(0, 0, cv.width, cv.height);

            /* Draw the cloud */
            context.drawImage(cloud1, cloud1_x, 10, 50, 15);
            context.drawImage(cloud2, cloud2_x, 30, 50, 15);

            /* Draw the heart */
            Heart.initialize(context);


            /* Draw the sprites */
            Player.draw();
            Desperado.draw();
            Horses.draw();

            requestAnimationFrame(doFrame);

        }

        requestAnimationFrame(doFrame);

    })
}

// Update online users every 500 ms.
setInterval(() => {
    fetch('/get-users')
      .then(response => response.json())
      .then(data => {
        console.log('Users:', data.user_number);
        $("#user-counter").text(`Online users: ${data.user_number}`);
      })
      .catch(error => console.error('Error fetching users:', error));
  }, 500); // This function will execute every 500 milliseconds