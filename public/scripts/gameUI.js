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

    const ctx = $("#game-canvas").get(0).getContext("2d");
    const sprite = Sprite(ctx, 600, 350);

    const getSprite = function() {
        return sprite;
    }

    const initialize = function() {
        sprite.setSequence(sequences.play)
            .useSheet("../src/img/cowboy_sprite.png");
        sprite.draw();
    };

    const play = function() {
        // Default animation, make Cowboy visible and play animation
        // Cowboy.play();
        sprite.setSequence(sequences.idle);
    }

    const reload = function() {
        // Stop player animation and play reloading animation
        // Cowboy.reload();
        sprite.setSequence(sequences.reload);
    }

    const shoot = function() {
        // Player shoot animation
        // Cowboy.shoot();
        // Sound.shoot();
        sprite.setSequence(sequences.shoot);
    }

    const damaged = function(hp) {
        $('#playerLife').text(hp);
        $('#roundLost').show();
        setTimeout(()=> {
            $('#roundLost').hide();
        }, 2000);

        // Cowboy.damaged(); //animation damage
        // image will blink and move left and right
        let moveDist = 10;
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
                sprite.setVisible(false);
                sprite.setXY(originalX, originalY);
                return;
            }

            sprite.setVisible(true);

            const moveX = direction == 1 ? originalX + moveDist : originalX - moveDist;
            sprite.setXY(moveX, originalY);
            direction *= 1;

            // make sprite invisible after 100ms
            setTimeout(() => {
                sprite.setVisible(false);
            }, 100);
        }, intervalTime);

        // Heart.damaged('player') Heart icon remove animation
    };

    const penalize = function() {
        console.log('your penalty!');
        $('#status').show();
        // Player stun animation
        // Cowboy.stun();

        sprite.setOpacity(0.5);
        sprite.setSequence(sequences.stop);
        // setTimeout(() => {
        //     sprite.setOpacity(1);
        //     sprite.setSequence(sequences.play);
        // }, duration);
    };

    const depenalize = function(duration) {
        console.log('your depenalty!');
        $('#status').hide();

        // Player stun-animation stop
        // Cowboy.destun();
        setTimeout(() => {
            sprite.setOpacity(1);
            sprite.setSequence(sequences.play);
        }, duration)
    };

    const dead = function() {
        // Cowboy.dead();
        sprite.setSequence(sequences.die);
    };

    const update = function(time) {
        sprite.update(time);
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
    
    return {initialize, player_key, play, reload, shoot, damaged, penalize, depenalize, dead, update, getSprite};
})();

const Desperado = (function() {
    const sequences = {
        play: { x: 0, y: 256, width: 64, height: 64, count: 4, timing: 200, loop: true },
        reload: { x: 0, y: 320, width: 64, height: 64, count: 6, timing: 200, loop: false },
        shoot: { x: 0, y: 384, width: 64, height: 64, count: 3, timing: 200, loop: false },
        die: { x: 0, y: 448, width: 64, height: 64, count: 5, timing: 200, loop: false },
    }

    const ctx = $("#game-canvas").get(0).getContext("2d");
    const sprite = Sprite(ctx, 200, 350);
    // sprite.setSequence(sequences.play)
    //         .useSheet("../src/img/cowboy_sprite.png");


    const getSprite = function() {
        return sprite;
    }

    const initialize = function() {
        // sprite = Sprite(ctx, 600, 350);
        sprite.setSequence(sequences.play)
            .useSheet("../src/img/cowboy_sprite.png");
        sprite.draw();
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
    }

    const shoot = function() {
        // Player shoot animation
        // Cowboy.shoot();
        sprite.setSequence(sequences.shoot);
    }

    const damaged = function(hp) {
        $('#desperadoLife').text(hp);
        $('#roundWin').show();
        setTimeout(()=> {
            $('#roundWin').hide();
        }, 2000);

        // Desperado.damaged(); //animation damage
        // image will blink and move left and right
        let moveDist = 10;
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
                sprite.setVisible(false);
                sprite.setXY(originalX, originalY);
                return;
            }

            sprite.setVisible(true);

            const moveX = direction == 1 ? originalX + moveDist : originalX - moveDist;
            sprite.setXY(moveX, originalY);
            direction *= 1;

            // make sprite invisible after 100ms
            setTimeout(() => {
                sprite.setVisible(false);
            }, 100);
        }, intervalTime);

        // Heart.damaged('desperado') Heart icon remove animation
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
        setTimeout(() => {
            sprite.setOpacity(1);
            sprite.setSequence(sequences.play);
        }, duration)
    };

    const dead = function() {
        // Cowboy.dead();
        sprite.setSequence(sequences.die);
    };

    const update = function(time) {
        sprite.update(time);
    }


    return {initialize, play, reload, shoot, damaged, penalize, depenalize, dead, update, getSprite};
})();

const GameScreen = (function() {
    const initialize = function() {};


    const displayRoundStart = function(roundNum) {
        // Play animation
        // console.log('display round start')
        Player.play();
        Desperado.play();
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



const UI = (function() {
    // This function initializes the UI
    const initialize = function() {
        // Initialize the components
        Player.initialize();
        // Desperado.initialize();
        // const components = [Player, Desperado, Sound, Heart, GameScreen];
        // for (const component of components) {
        //     component.initialize();
        // }

    };

    return { initialize };
})();