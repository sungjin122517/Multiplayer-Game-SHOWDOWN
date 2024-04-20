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
        $('#loading').hide();
        Socket.leaveQueue();
    });

});

function showSignedInPage() {
    $("#main-page").hide();
    $("#signed-in-page").show();
}

function showMainPage() {
    $("#main-page").show();
    $("#signed-in-page").hide();
}

let loadingInterval;
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
    loadingText.text("Loading.");
    clearInterval(loadingInterval);
}