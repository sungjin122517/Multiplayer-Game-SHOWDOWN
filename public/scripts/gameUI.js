// For Jin
// To implement: play, reload, shoot, damaged, penalize, depenalize

// For Junyeol
// To implement: displayShowdown, displayRoundStart, displayRoundWinner, gameWin, gameLost, displayGameStat


const Player = (function() {
    const sequences = {
        play: { x: 0, y: 0, width: 64, height: 64, count: 4, timing: 200, loop: true },
        reload: { x: 0, y: 64, width: 64, height: 64, count: 6, timing: 200, loop: false },
        shoot: { x: 0, y: 128, width: 64, height: 64, count: 3, timing: 200, loop: false },
        die: { x: 0, y: 192, width: 64, height: 64, count: 5, timing: 200, loop: false },
        stop: { x: 0, y: 0, width: 64, height: 64, count: 1, timing: 200, loop: false }
    }

    let sprite = null;

    const getSprite = function() {
        return sprite;
    }

    const initialize = function(ctx) {
        sprite = Sprite(ctx, 65, 90);
        sprite.setSequence(sequences.play)
            .useSheet("../src/img/cowboy_sprite.png");
    };

    const play = function() {
        // Default animation, make Cowboy visible and play animation
        // Cowboy.play();
        sprite.setSequence(sequences.play);
    }

    const reload = function() {
        // Stop player animation and play reloading animation
        // Cowboy.reload();
        sprite.setSequence(sequences.reload);
        Horses.stop();
        Sound.reload();
    }

    const shoot = function() {
        // Player shoot animation
        // Cowboy.shoot();
        // Sound.shoot();
        sprite.setSequence(sequences.shoot);
        Sound.shoot();
    }

    const damaged = function(hp) {
        console.log('damaged, and hp is: ', hp)
        $('#playerLife').text(hp);
        $('#roundLost').show();
        setTimeout(()=> {
            $('#roundLost').hide();
        }, 2000);

        // Cowboy.damaged(); //animation damage
        // image will blink and move left and right
        let moveDist = 5;
        let direction = 1 // 1 for right, -1 for left
        const intervalTime = 200;
        const damageDuration = 2000;
        const startTime = Date.now();
        const originalX = sprite.getXY().x;
        const originalY = sprite.getXY().y;

        sprite.setVisible(true);

        const interval = setInterval(() => {
            if (Date.now() - startTime > damageDuration) {
                clearInterval(interval);
                sprite.setVisible(true);
                sprite.setXY(originalX, originalY);
                sprite.setSequence(sequences.stop);
                Horses.stop();
                return;
            }

            sprite.setVisible(true);

            const moveX = direction == 1 ? originalX + moveDist : originalX - moveDist;
            sprite.setXY(moveX, originalY);
            direction *= -1;

            // make sprite invisible after 100ms
            setTimeout(() => {
                sprite.setVisible(false);
            }, 100);

        }, intervalTime);

        // Heart.damaged('player') Heart icon remove animation
        Heart.damaged('player', hp);
    };

    const penalize = function() {
        console.log('your penalty!');
        $('#status').show();
        // Player stun animation
        // Cowboy.stun();

        sprite.setOpacity(0.5);
        sprite.setSequence(sequences.stop);
    };

    const depenalize = function() {
        console.log('your depenalty!');
        $('#status').hide();

        // Player stun-animation stop
        // Cowboy.destun();

        sprite.setOpacity(1);
        sprite.setSequence(sequences.play);
    };

    const dead = function() {
        // Cowboy.dead();
        sprite.setSequence(sequences.die);
    };

    const update = function(time) {
        sprite.update(time);
    }

    const draw = function() {
        sprite.draw();
    }


    // constantly detects key press
    const player_key = function() {
        console.log('play game');

        $(document).on("keydown", function(event) {
            // Key: space
            if (event.keyCode == 32) {
                Socket.pressed();
            }
            // Key: r
            if (event.keyCode == 82) {
                console.log('Ready');
                Socket.pressed_r();
            }
            // Key: Ctrl + p
            var ctrlPressed = event.ctrlKey || event.metaKey; // For Mac Command key compatibility
            var pKeyPressed = event.which === 80; // Key code for "P" key
            
            if (ctrlPressed && pKeyPressed) {
                Socket.pressed_ctrl_p();
            }
        })
    };
    
    return {initialize, player_key, play, reload, shoot, damaged, penalize, depenalize, dead, update, draw, getSprite};
})();

const Desperado = (function() {
    const sequences = {
        play: { x: 0, y: 256, width: 64, height: 64, count: 4, timing: 200, loop: true },
        reload: { x: 0, y: 320, width: 64, height: 64, count: 6, timing: 200, loop: false },
        shoot: { x: 0, y: 384, width: 64, height: 64, count: 3, timing: 200, loop: false },
        die: { x: 0, y: 448, width: 64, height: 64, count: 5, timing: 200, loop: false },
        stop: { x: 0, y: 256, width: 64, height: 64, count: 1, timing: 200, loop: false }
    }

    let sprite = null;


    const getSprite = function() {
        return sprite;
    }

    const initialize = function(ctx) {
        sprite = Sprite(ctx, 200, 90);
        sprite.setSequence(sequences.play)
            .useSheet("../src/img/cowboy_sprite.png");
    }

    const play = function() {
        // Default animation, make opponent visible and play animation
        // Desperado.play();
        sprite.setSequence(sequences.play);
    }

    const reload = function() {
        // Stop opponent animation and play reloading animation
        // Desperado.reload();
        sprite.setSequence(sequences.reload);
        Horses.stop();
        Sound.reload();
    }

    const shoot = function() {
        // Player shoot animation
        // Cowboy.shoot();
        sprite.setSequence(sequences.shoot);
        Sound.shoot();
    }

    const damaged = function(hp) {
        $('#desperadoLife').text(hp);
        $('#roundWin').show();
        setTimeout(()=> {
            $('#roundWin').hide();
        }, 2000);

        // image will blink and move left and right
        let moveDist = 5;
        let direction = 1 // 1 for right, -1 for left
        const intervalTime = 200;
        const damageDuration = 2000;
        const startTime = Date.now();
        const originalX = sprite.getXY().x;
        const originalY = sprite.getXY().y;

        sprite.setVisible(true);

        const interval = setInterval(() => {
            if (Date.now() - startTime > damageDuration) {
                clearInterval(interval);
                sprite.setVisible(true);
                sprite.setXY(originalX, originalY);
                sprite.setSequence(sequences.stop);
                Horses.stop();
                return;
            }

            sprite.setVisible(true);

            const moveX = direction == 1 ? originalX + moveDist : originalX - moveDist;
            sprite.setXY(moveX, originalY);
            direction *= -1;

            // make sprite invisible after 100ms
            setTimeout(() => {
                sprite.setVisible(false);
            }, 100);
        }, intervalTime);

        // Heart.damaged('desperado') Heart icon remove animation
        Heart.damaged('desperado', hp);
    };

    const penalize = function() {
        console.log('desperado penalty!');
        $('#desperadoStatus').show();
        // Player stun animation
        // Desperado.stun();

        sprite.setOpacity(0.5);
        sprite.setSequence(sequences.stop);
        // setTimeout(() => {
        //     sprite.setOpacity(1);
        //     sprite.setSequence(sequences.play);
        // }, duration);
    };

    const depenalize = function() {
        console.log('desperado depenalty!');
        $('#desperadoStatus').hide();

        // Player stun-animation stop
        // Desperado.destun();

        sprite.setOpacity(1);
        sprite.setSequence(sequences.play);
    };

    const dead = function() {
        // Cowboy.dead();
        sprite.setSequence(sequences.die);
    };

    const update = function(time) {
        sprite.update(time);
    }

    const draw = function() {
        sprite.draw(true);
    }


    return {initialize, play, reload, shoot, damaged, penalize, depenalize, dead, update, draw, getSprite};
})();

const GameScreen = (function() {
    const initialize = function() {};


    const displayRoundStart = function(roundNum) {
        // Play animation
        // console.log('display round start')
        Player.play();
        Desperado.play();
        Horses.walk();
        Sound.whistle();

        $('#victory').hide();

        const roundStartDiv = $('#roundStart');
        const roundNumSpan = $('#roundNum');
        
        roundNumSpan.text(roundNum);
        
        roundStartDiv.fadeIn(2000, function() {
            // wait 3 second
          setTimeout(function() {
            roundStartDiv.fadeOut(2000, function() {
                roundStartDiv.css('display', 'none');
                Player.reload();
                Desperado.reload();
            });
          }, 3000);
        });
    }

    const displayShowdown = function() {
        // display SHOWDOWN on html
        $("#showdown_cue").show();
    }

    const displayRoundWinner = function(playerId, roundNum) {
        $("#showdown_cue").hide();

        Sound.whistle_off();

        const roundNumSpan = $('#roundNum');
        const roundWinnerSpan = $('#roundWinner');
        const victoryDiv = $('#victory');
        
        roundNumSpan.text(roundNum);
        roundWinnerSpan.text(playerId);
        
        victoryDiv.show()
    }

    const gameWin = function() {
        // display gamewin
    }

    const gameLost = function() {
        // display Gameover by adding <div> </div>
    }

    const displayGameStat = function(kdaStat, timeStat, socketId, winnerId) {
        setTimeout(() => {
            $('#game-stats-modal').show();
        }, 2000);
        console.log(socketId, winnerId);
        console.log(kdaStat);
        // display stats
        if (socketId !== winnerId) {    // won TODO: currently socketId winnerId don't match
            $("#won-lost-indicator").text("You won");
        } else {                        // lost
            $("#won-lost-indicator").text("You lost");
        }

        let kdaData = kdaStat.socketId.value;
        $("#you-kill").text(kdaData.kill);
        $("#other-kill").text(kdaData.death);

        let youSum = 0;
        let otherSum = 0;
        let totalRound = 0;
        Object.entries(timeStat).forEach(([_,value]) => {
            totalRound++;
            Object.entries(value).forEach(([id,rt]) => {
                if (id === socketId) {
                    youSum += rt;
                } else {
                    otherSum += rt;
                }
            });
        });

        $("#you-rt").text(youSum/totalRound);
        $("#other-rt").text(otherSum/totalRound);
    }


    return {initialize, displayShowdown, displayRoundStart, displayRoundWinner, displayGameStat};
}
)();

const Horses = (function() {
    const sequences = {
        right: { x: 0, y: 96, width: 96, height: 96, count: 3, timing: 200, loop: true },
        left: { x: 0, y: 192, width: 96, height: 96, count: 3, timing: 200, loop: true },
        rightStop: { x: 96, y: 96, width: 96, height: 96, count: 1, timing: 200, loop: false },
        leftStop: { x: 96, y: 192, width: 96, height: 96, count: 1, timing: 200, loop: false }
    };

    let spriteLeft = null;
    let spriteRight = null;

    const initialize = function(ctx) {
        spriteLeft = Sprite(ctx, 20, 90);
        spriteRight = Sprite(ctx, 230, 90);

        spriteLeft.setSequence(sequences.left)
            .useSheet("../src/img/horse_sprite.png");
        spriteRight.setSequence(sequences.right)
            .useSheet("../src/img/horse_sprite.png");
    }

    const walk = function() {
        spriteLeft.setSequence(sequences.left);
        spriteRight.setSequence(sequences.right);
    }

    const stop = function() {  
        spriteLeft.setSequence(sequences.leftStop);
        spriteRight.setSequence(sequences.rightStop);
    }

    const penalizeLeft = function() {
        spriteLeft.setOpacity(0.5);
        spriteLeft.setSequence(sequences.leftStop);
    }

    const penalizeRight = function() {
        spriteRight.setOpacity(0.5);
        spriteRight.setSequence(sequences.rightStop);
    }

    const depenalizeLeft = function() {
        spriteLeft.setOpacity(1);
        spriteLeft.setSequence(sequences.left);
    }

    const depenalizeRight = function() {
        spriteRight.setOpacity(1);
        spriteRight.setSequence(sequences.right);
    }

    const update = function(time) {
        spriteLeft.update(time);
        spriteRight.update(time);
    }

    const draw = function() {
        spriteLeft.draw();
        spriteRight.draw();
    }

    return {initialize, walk, stop, update, draw, penalizeLeft, penalizeRight, depenalizeLeft, depenalizeRight};

})();

const Heart = (function() {
    // create 3 hearts each for player and desperado, and store them in an array
    const heart = new Image();
    heart.src = "../src/img/heart.png";
    const heart_empty = new Image();
    heart_empty.src = "../src/img/heart_empty.png";

    const heartSettings = {
        player: { x: 10, y: 15, hearts: [heart, heart, heart] },
        desperado: { x: 280, y: 15, hearts: [heart, heart, heart] }
    }

    const initialize = function(ctx) {
        // Draw 3 hearts for player on the top left of the screen
        heartSettings.player.hearts.forEach((heart, idx) => {
            ctx.drawImage(heart, heartSettings.player.x + idx * 15, heartSettings.player.y, 10, 10);
        });

        // Draw 3 hearts for desperado on the top right of the screen
        heartSettings.desperado.hearts.forEach((heart, idx) => {
            ctx.drawImage(heart, heartSettings.desperado.x - idx * 15, heartSettings.desperado.y, 10, 10);
        });
    }

    const damaged = function(player, hp) {
        // remove a heart from the player or desperado
        if (player == 'player') {
            if (hp >= 0 && hp < heartSettings.player.hearts.length) {
                heartSettings.player.hearts[hp] = heart_empty;
            }
        } else if (player == 'desperado') {
            if (hp >= 0 && hp < heartSettings.desperado.hearts.length) {
                heartSettings.desperado.hearts[hp] = heart_empty;
            }
        }
    }

    return {initialize, damaged};
})();

const Sound = (function() {
    const sounds = {
        background: new Audio("../src/audio/cowboy2.mp3"),
        shoot: new Audio("../src/audio/shoot.wav"),
        whistle: new Audio("../src/audio/whistle.mp3"),
        gameover: new Audio("../src/audio/gameover.wav"),
        reload: new Audio("../src/audio/reload.wav"),
    }

    const initialize = function(ctx) {
        // Initialize the audio
        // sounds.background.loop = true;
    }

    const background = function() {
        // play background sound
        sounds.background.play();
    }

    const shoot = function() {
        // play shoot sound
        sounds.shoot.play();
    }

    const whistle = function() {
        // play whistle sound
        sounds.whistle.play();
    }

    const whistle_off = function() {
        // stop whistle sound
        sounds.whistle.pause();
        sounds.whistle.currentTime = 0;
    }

    const gameover = function() {
        // play gameover sound
        sounds.gameover.play();
    }

    const reload = function() {
        // play reload sound
        sounds.reload.play();
    }

    return {initialize, background, shoot, whistle, whistle_off, gameover, reload};
})();


const UI = (function() {
    // This function initializes the UI
    const initialize = function(ctx) {
        console.log('UI initialized')
        // Initialize the components
        const components = [Player, Desperado, Horses, Heart, GameScreen, Sound];
        for (const component of components) {
            component.initialize(ctx);
        }

    };

    return { initialize };
})();