const express = require("express");
const bcrypt = require("bcrypt");
const fs = require("fs");
const session = require("express-session");

const app = express();


app.use(express.static('public'));

app.use(express.json());

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
            io.to(room).emit('matched', room);
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
    

})

function disconnectCleanUp(username) {
    const users = JSON.parse(fs.readFileSync("./data/users.json"));
    users[username]['signedIn'] = false;
    fs.writeFileSync("./data/users.json", JSON.stringify(users, null, " "));
    user_number -= 1;
}

// Use a web server to listen at port 8000
// Previous HTTP communication
// app.listen(8000, () => {
//     console.log("The chat server has started...");
// });
httpServer.listen(8000, () => {
    console.log("The server is running...");
});
