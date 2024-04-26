const express = require("express");
const bcrypt = require("bcrypt");
const fs = require("fs");
const session = require("express-session");

const app = express();


app.use(express.static('public'));

app.use(express.json());

// Serve the index.html file for all sockets
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

const gameSession = session({
    secret: "game",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { maxAge: 300000 }
});

app.use(gameSession);

function containWordCharsOnly(text) {
    return /^\w+$/.test(text);
}

let user_number = 0;

// Handle the /sign-up endpoint
app.post("/sign-up", (req, res) => {
    // Get the JSON data from the body
    const { username, password } = req.body;

    //
    // D. Reading the users.json file
    //
    const users = JSON.parse(fs.readFileSync("./data/users.json"));
    // console.log(users);
    //
    // E. Checking for the user data correctness
    //
    if (!username || !password ) {
        res.json({
            status: "error",
            error: "Either username or password is empty!"
        })
        return;
    }
    if (!containWordCharsOnly(username)) {
        res.json({
            status: "error",
            error: "The username can only contain underscore, letter or numbers!"
        })
        return;
    }
    if (username in users) {
        res.json({
            status: "error",
            error: "The username already exists!"
        })
        return;
    }
    //
    // G. Adding the new user account
    //
    // console.log(typeof(password), password);
    const hash = bcrypt.hashSync(password, 10);
    const signedIn = false;
    users[username] = { hash, signedIn }; //TODO: nonce later?
    // console.log(users);
    //
    // H. Saving the users.json file
    //
    fs.writeFileSync("./data/users.json", JSON.stringify(users, null, " "));
    //
    // I. Sending a success response to the browser
    //
    res.json({
        status: "success",
    })
    return;
});

// Handle the /signin endpoint
app.post("/sign-in", (req, res) => {
    // Get the JSON data fr om the body
    const { username, password } = req.body;

    //
    // D. Reading the users.json file
    //
    const users = JSON.parse(fs.readFileSync("./data/users.json"));
    // console.log('signin called');
    //
    // E. Checking for username/password
    //
    if (!(username in users)) {
        res.json({
            status: "error",
            error: "The username does not exist."
        })
        return;
    }

    if (users[username]['signedIn'] === true) {
        res.json({
            status: "error",
            error: "The account is already signed in."
        });
        return;
    }
    // console.log(users[username]);
    // console.log(users[username]['hash']);


    const storedHash = users[username]['hash'];
    const passwordMatch = bcrypt.compareSync(password, storedHash);
    if (!passwordMatch) {
        console.log('failed login attempt');
        res.json({
            status: "error",
            error: "The password does not match with username"
        })
        return;
    }
    
    req.session.user = {username};

    console.log(users[username]['signedIn']);
    users[username]['signedIn'] = true;
    console.log(users[username]['signedIn']);
    fs.writeFileSync("./data/users.json", JSON.stringify(users, null, " "));

    // G. Sending a success response with the user account
    //
    res.json({
        status: "success", user: {username},
    })

    user_number += 1;

    return;
});

// Handle the /sign-out endpoint
app.get("/sign-out", (req, res) => {

    //
    // Deleting req.session.user
    //
    delete req.session.user;

    //
    // Sending a success response
    //
    res.json({
        status: "success",
    })


    return;
});

// Handle the /get-users endpoint
app.get("/get-users", (req, res) => {

    res.send({ user_number: user_number });
    return;
});

const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer( app ); 
// using the provided app as the request handler.
// httpServer represents Express.js application as an HTTP server
const io = new Server (httpServer);
// Socket.IO server on same port as httpServer

io.use((socket, next) => {
    gameSession(socket.request, {}, next);
})

let queue = [];
let rooms = {};
let roomVariables = [];




// Assume only one gameRoom is made (only two players are)
let numberOfRounds = 0;
const maxUsersLife = 3;

let isRoundStart = false;
let allowFire = false;

let gameWinner = null;
let roundWinner = null;

const penaltyTime = 2;  // in seconds

// Showdown time calculation: 3 seconds ~ 3+(rangeShowdownTime) seconds
let showdownTime = null;
const minShowdownTime = 3;
const rangeShowdownTime = 5;


let roundStartTime;
let validResponseTime;

const gameJoinUsersSet = new Set();
const readyUsersSet = new Set();
const cheatUsersSet = new Set();

const penalizedUsers = {};
const gameUsersHealth = {};
const responseStatList = {};
const kdaStatList = {};





// listen to "connection" emitted by socket io. immediate connection event when client connected
io.on("connection", (socket) => {
    console.log('A user connected:', socket.id);
    const session = socket.request.session;


    socket.on('enter queue', () => {
        console.log("player entered queue:", socket.id);
        queue.push(socket);
        if (queue.length >= 2) {
            const [player1, player2] = queue.splice(0, 2);
            const room = `room_${player1.id}_${player2.id}`;
            player1.join(room);
            player2.join(room);
            rooms[player1.id] = room;
            rooms[player2.id] = room;
            // io.to(room).emit('matched', room);
            gameJoinUsersSet.add(player1.id);
            gameJoinUsersSet.add(player2.id);
            io.to(room).emit('matched', 'game.html');
            // Announce round start to players
            io.emit("game set", JSON.stringify(Array.from(gameJoinUsersSet)));
            gameJoinUsersSet.forEach((x) => {
                gameUsersHealth[x] = maxUsersLife;
                penalizedUsers[x] = 0;
                kdaStatList[x] = {'kill' : 0, 'death' : 0};
            });
            console.log(`Matched players in room: ${room}`);
        }
    });

    socket.on('leave queue', () => {
        queue = queue.filter(s => s.id !== socket.id); // Remove from queue if they decide to leave
        console.log(`User ${socket.id} left the queue`);
    })

    socket.on('disconnect', () => {
        queue = queue.filter(s => s.id !== socket.id);

        // Handle disconnection within a room
        const room = rooms[socket.id];
        if (room) {
            socket.leave(room);
            io.to(room).emit('player disconnected', `Player ${socket.id} has left the game.`);
            console.log(`Player ${socket.id} disconnected from room ${room}`);
            // Clean up the room and reset game state if needed
            io.socketsLeave(room);
        }
        disconnectCleanUp(session.user.username);
        console.log('User disconnected:', socket.id);
    });
    
    socket.on('leave room', () => {
        const room = rooms[socket.id];
        let otherSocketId = null;

        // Iterate over the rooms object to find the other socket in the same room
        for (let id in rooms) {
            if (rooms[id] === room && id !== socket.id) {
                otherSocketId = id;
                break;
            }
        }

        // Notify the other socket
        if (otherSocketId) {
            io.to(otherSocketId).emit('One player left');
        }

        // Remove both sockets from the room data structure
        delete rooms[socket.id]; // Assuming each socket.id has a unique room key
        delete rooms[otherSocketId]; // Clean up the other socket's room reference
    });

    socket.on('replay', () => {
        const room = rooms[socket.id];
        let otherSocketId = null;

        // Iterate over the rooms object to find the other socket in the same room
        for (let id in rooms) {
            if (rooms[id] === room && id !== socket.id) {
                otherSocketId = id;
                break;
            }
        }

        const index = roomVariables.indexOf(room);
        if (index > -1) {
            roomVariables.push(room);
        } else {
            roomVariables.splice(index, 1);
            io.to(room).emit('replay match');
        }
    });


    /*************
     * 
     * 
     *  GAME IMPLEMENTATION PART
     * 
     * 
     */

    // socket.on("player join", () => {
    //     if (gameJoinUsersSet.size == 0) {
    //         gameJoinUsersSet.add(socket.id);
    //         console.log('One player joined. Room size: %d', gameJoinUsersSet.size);
    //     }
    //     else if (gameJoinUsersSet.size == 1) {
    //         gameJoinUsersSet.add(socket.id);
    //         console.log('2 players joined: ');
            
    //         // Announce round start to players
    //         io.emit("game set", JSON.stringify(Array.from(gameJoinUsersSet)));
    //         gameJoinUsersSet.forEach((x) => {
    //             gameUsersHealth[x] = maxUsersLife;
    //             penalizedUsers[x] = 0;
    //             kdaStatList[x] = {'kill' : 0, 'death' : 0};
    //         })

    //         console.log(gameUsersHealth);
    //     }
    //     else {
    //         console.log('excessive join requested');
    //     }
    // })


    socket.on("ready", () => {
        console.log('One player stated ready');
        readyUsersSet.add(socket.id);
        console.log(readyUsersSet);
        console.log(gameJoinUsersSet);
        // Start when all players are ready
        if (readyUsersSet.size == gameJoinUsersSet.size) {
            numberOfRounds++;
            
            responseStatList[numberOfRounds] = {};
            gameJoinUsersSet.forEach((id)=> {
                responseStatList[numberOfRounds][id] = null;
            })
            console.log('All players are ready: ');
            
            // Announce round start to players
            isRoundStart = true;
            io.emit("round start", JSON.stringify(Array.from(readyUsersSet)), numberOfRounds);

            executeCountdown();
        }
    })



    socket.on("player pressed", () => {
        const id = socket.id;
        if (isRoundStart) {
            if (!allowFire) {
                // Penalize if non-cheat AND hasn't been penalized
                if (!cheatUsersSet.has(id) && penalizedUsers[id] == 0) {
                    penalizedUsers[id] = penaltyTime;
                    io.emit("penalize user", JSON.stringify(Array.from(readyUsersSet)), id);
                    // free user
                    dePenalize(socket.id, penaltyTime*1000);
                }
            }
            else if (allowFire) {
                if (penalizedUsers[id] == penaltyTime) {
                    console.log(penalizedUsers);
                    console.log('user still in penalty');
                } else {
                    // Shoot animation
                    io.emit("user shoot", JSON.stringify(Array.from(readyUsersSet)), id);

                    // Only update roundWinner once
                    if (!roundWinner) {
                        roundWinner = id;

                        let roundLoser;
                        // Iterating over readyUsersSet
                        readyUsersSet.forEach((id) => {
                            if (id != roundWinner) roundLoser = id;
                        });
                        gameUsersHealth[roundLoser]--;
                        kdaStatList[roundWinner]['kill']++;
                        kdaStatList[roundLoser]['death']++;
                        console.log(gameUsersHealth);
                        console.log('Winner: %s', roundWinner);
                        roundEnd(500);
                    }

                    // update statistics
                    validResponseTime = Date.now();
                    if (!responseStatList[numberOfRounds][id]) {
                        responseStatList[numberOfRounds][id] = validResponseTime - roundStartTime;
                    }
                }
            }
        } else {
            console.log('game has not started yet')
        }
    })

    socket.on("cheat mode", () => {
        const id = socket.id;
        console.log('Player entered cheat mode');
        if (!cheatUsersSet.has(id)) cheatUsersSet.add(id);
        else cheatUsersSet.delete(id);
    })


})

function disconnectCleanUp(username) {
    const users = JSON.parse(fs.readFileSync("./data/users.json"));
    users[username]['signedIn'] = false;
    fs.writeFileSync("./data/users.json", JSON.stringify(users, null, " "));
    user_number -= 1;
}


/*****
 * 
 * 
 * GAME PART
 * 
 * 
 */


function countdown(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // console.log('%d sec countdown finished', time/1000);
            resolve();
        }, time);
    });
}

async function executeCountdown() {
    // Round x
    console.log('### Round %d..', numberOfRounds);
    await countdown(5000); 

    // Showdown
    const random = Math.random();
    const duration = random * rangeShowdownTime + minShowdownTime;
    showdownTime = duration * 1000;

    console.log('!Showdown random time: %d seconds', showdownTime/1000);
    await countdown(showdownTime);
    console.log('Showdown!');
    io.emit("showdown");
    allowFire = true;

    roundStartTime = Date.now();
}


async function roundEnd(time) {
    await countdown(time);
    console.log('Computed winner for %d seconds', time/1000);
    console.log(kdaStatList);

    io.emit("round result", JSON.stringify(Array.from(readyUsersSet)), roundWinner, JSON.stringify(gameUsersHealth), numberOfRounds);
    readyUsersSet.clear();
    roundWinner = null;
    isRoundStart = false;
    allowFire = false;
    for (user in penalizedUsers) {
        penalizedUsers[user] = 0;
    }

    // Check for game end
    for (user in gameUsersHealth) {
        if (gameUsersHealth[user] == 0) gameEnd();
    }
}

function gameEnd() {
    for (user in gameUsersHealth) {
        if (gameUsersHealth[user] != 0) gameWinner = user;
    }
    console.log(responseStatList);
    console.log(kdaStatList);
    io.emit("game result", JSON.stringify(Array.from(gameJoinUsersSet)), JSON.stringify(responseStatList), JSON.stringify(kdaStatList), gameWinner);
    gameWinner = null;
    numberOfRounds = null;

    // reset the object arrays {}
    Object.keys(gameUsersHealth).forEach(key => delete gameUsersHealth[key]);
    Object.keys(responseStatList).forEach(key => delete responseStatList[key]);
    Object.keys(kdaStatList).forEach(key => delete kdaStatList[key]);
    gameJoinUsersSet.clear();
}


async function dePenalize(playerId, time) {
    // console.log('Penalized user %s for %d seconds', playerId, time/1000);
    await countdown(time);
    penalizedUsers[playerId] = 0;
    io.emit("depenalize user", JSON.stringify(Array.from(readyUsersSet)), playerId);
}


// Use a web server to listen at port 8000
// Previous HTTP communication
// app.listen(8000, () => {
//     console.log("The chat server has started...");
// });
httpServer.listen(8000, () => {
    console.log("The server is running...");
});
