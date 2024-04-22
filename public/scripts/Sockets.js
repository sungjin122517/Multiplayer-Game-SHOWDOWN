const Socket = (function() {
    let socket = null;

    const connect = function() {
        socket = io();
        socket.on("connect", () => {
            // Handlers for game-specific events can be setup here if needed
            
        });

        // socket.on("matched", (room) => {
        //     console.log("You have been matched! Room ID: ", room);
        //     enterGameRoom(room);
        // });
        // Listen for the "Game Start" event
        socket.on('matched', (gameHtml) => {
            // Replace the content with the new game HTML
            document.open();
            document.write(gameHtml);
            document.close();
        });

        // Listen for a player disconnection within your game room
        socket.on("player disconnected", (message) => {
            console.log(message); // Log or display the message to the user
            showSignedInPage();
        });

        // Listen for the other player leaving the room
        socket.on("One player left", (message) => {
            showSignedInPage();
        });

        // To be implemented
        socket.on("replay match", (message) => {
            //
        });
    };

    const disconnect = function() {
        if (socket) {
            socket.disconnect();
            socket = null;
        }
    };

    const enterQueue = function() {
        console.log("Try to enter the queue");
        if (socket && socket.connected) {
            console.log("Entered the queue");
            socket.emit("enter queue");
        }
    };

    const leaveQueue = function() {
        console.log("Leave the queue");
        if (socket && socket.connected) {
            socket.emit("leave queue");
        }
    };

    const enterGameRoom = function(room) {
        // Functionality to switch view to the game room
        console.log("Entering game room:", room);
        // This could also change the client state, e.g., display the game room UI
        hideLoading();
        $("#main-page").hide();
        $("#signed-in-page").hide();
        $("#game-page").show();
        $("#temp-gameroomtext").text(room);
        setTimeout(() => {
            $('#game-stats-modal').show();
        }, 5000);
    };

    const leaveGameRoom = function() {
        if (socket && socket.connected) {
            socket.emit("leave room");
        }
    }

    const replayGame = () => {
        if (socket && socket.connected) {
            socket.emit("replay");
        }
    }
    
    const replayMatched = () => {
        hideReplayLoading();
        $("game-stats-modal").hide();
    }

    return { connect, disconnect, enterQueue, leaveQueue, leaveGameRoom, replayGame, replayMatched };
})();
