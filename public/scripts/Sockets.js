const Socket = (function() {
    let socket = null;

    const connect = function() {
        console.log("XXconnectCalledXX");
        socket = io();
        socket.on("connect", () => {
            // Handlers for game-specific events can be setup here if needed
            
        });
        socket.on('matched', (gameHtml) => {
            enterGameRoom("room");
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
            console.log("Hide replay");
            $("#game-stats-modal").hide();
            hideReplayLoading();
            enterGameRoom("room");
            
        });

        /*****
         * 
         * 
         * GAME PLAY
         * 
         */
        
        socket.on("round start", (playersList, roundNum) => {
            $("#pressR").hide();
            const socketId = socket.id;
            if (playersList.includes(socketId)) {
                GameScreen.displayRoundStart(roundNum);
                // player re-live again
                // play whistle.mp3
            }
        })

        socket.on("round result", (playersList, winnerId, hpList, roundNum) => {
            const socketId = socket.id;

            if (playersList.includes(socketId)) {
                hpList = JSON.parse(hpList);

                let desperadoHP;
                // Iterating over object keys
                for (const id in hpList) {
                    if (id !== socketId) {
                        desperadoHP = hpList[id];
                        break; // Exit the loop once the other key is found
                    }
                }

                // Sound.damaged();
                if (winnerId != socketId) Player.damaged(hpList[socketId]);
                else Desperado.damaged(desperadoHP);

                GameScreen.displayRoundWinner(winnerId, roundNum);

                pressR = setTimeout(() => {
                    $("#pressR").text("Press R to start the game");
                    $("#pressR").show();
                }, 3000);
            }
        })

        socket.on("showdown", () => {
            GameScreen.displayShowdown();
        })

        socket.on("user shoot", (playersList, id) => {
            const socketId = socket.id;
            if (playersList.includes(socketId)) {
                if (id == socketId) Player.shoot();
                else Desperado.shoot();
            }
        })

        socket.on("penalize user", (playersList, penaltyUser) => {
            const socketId = socket.id;
            if (playersList.includes(socketId)) {
                if (penaltyUser == socketId) {
                    Player.penalize();
                    // Horses.penalizeLeft();
                }
                else {
                    Desperado.penalize();
                    // Horses.penalizeRight();
                }
            }
        })
        
        socket.on("depenalize user", (playersList, penaltyUser) => {
            const socketId = socket.id;
            if (playersList.includes(socketId)) {
                if (penaltyUser == socketId) {
                    Player.depenalize();
                    // Horses.depenalizeLeft();
                } else {
                    Desperado.depenalize();
                    // Horses.depenalizeRight();
                }
            }
        })
        
        socket.on("game set", (playersList, maxUsersLife) => {
            const maxHP = maxUsersLife;
            const socketId = socket.id;
            if (playersList.includes(socketId)) {
                console.log("Game set");
                GameScreen.initHP(maxHP);
                Player.play();
                Desperado.play();
                Horses.walk();
                Player.player_key();
            }
        })

        socket.on("game result", (playersList, timeList, kdaList, winnerId) => {
            const socketId = socket.id;
            if (playersList.includes(socketId)) {
                if (socketId == winnerId) Desperado.dead();
                else Player.dead();
                Sound.gameover();

                const timeStat = JSON.parse(timeList);
                const kdaStat = JSON.parse(kdaList);
                GameScreen.displayGameStat(kdaStat, timeStat, socketId, winnerId);
            }
        })
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
        pressed_j();
        hideLoading();
        startGame();
        $("#main-page").hide();
        $("#signed-in-page").hide();
        $("#game-page").show();
        $("#temp-gameroomtext").text(room);
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

    const pressed = function() {
        socket.emit("player pressed");
    }

    const pressed_r = function() {
        console.log("XX r pressed XX");
        socket.emit("ready");
        $("#pressR").text("Waiting for the Desperado...");
    }

    const pressed_j = function() {
        // TODO modify later
        socket.emit("player join");
    }

    const pressed_alt_p = function() {
        socket.emit("cheat mode");
        GameScreen.displayCheat();
    }

    return { connect, disconnect, enterQueue, leaveQueue, leaveGameRoom, replayGame, pressed, pressed_r, pressed_j, pressed_alt_p};
})();
