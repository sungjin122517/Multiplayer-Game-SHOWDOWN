// For Jin
// To implement: play, reload, shoot, damaged, penalize, depenalize

// For Junyeol
// To implement: displayShowdown, displayRoundStart, displayRoundWinner, gameWin, gameLost, displayGameStat


const Player = (function() {
    const play = function() {
        // Default animation, make Cowboy visible and play animation
        // Cowboy.play();
    }

    const reload = function() {
        // Stop player animation and play reloading animation
        // Cowboy.reload();
    }

    const shoot = function() {
        // Player shoot animation
        // Cowboy.shoot();
        // Sound.shoot();
    }

    const damaged = function(hp) {
        $('#playerLife').text(hp);
        $('#roundLost').show();
        setTimeout(()=> {
            $('#roundLost').hide();
        }, 2000);

        // Cowboy.damaged(); //animation damage
        // Heart.damaged('player') Heart icon remove animation
    };

    const penalize = function() {
        console.log('your penalty!');
        $('#status').show();
        // Player stun animation
        // Cowboy.stun();
    };

    const depenalize = function() {
        console.log('your depenalty!');
        $('#status').hide();
        // Player stun-animation stop
        // Cowboy.destun();
    };

    const dead = function() {
        // Cowboy.dead();
    };

    // TODO may be deleted later
    const initialize = function() {
        $(document).on("keydown", function(event) {
            // Key: j
            if (event.keyCode == 74) {
                Socket.pressed_j();
            }
        })
    };

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
    
    return {initialize, player_key, play, reload, shoot, damaged, penalize, depenalize, dead};
})();

const Desperado = (function() {
    const initialize = function() {
    }

    const play = function() {
        // Default animation, make opponent visible and play animation
        // Desperado.play();
    }

    const reload = function() {
        // Stop opponent animation and play reloading animation
        // Desperado.reload();
    }

    const shoot = function() {
        // Player shoot animation
        // Cowboy.shoot();
    }

    const damaged = function(hp) {
        $('#desperadoLife').text(hp);
        $('#roundWin').show();
        setTimeout(()=> {
            $('#roundWin').hide();
        }, 2000);

        // Desperado.damaged(); //animation damage
        // Heart.damaged('desperado') Heart icon remove animation
    };

    const penalize = function() {
        console.log('desperado penalty!');
        $('#desperadoStatus').show();
        // Player stun animation
        // Desperado.stun();
    };

    const depenalize = function() {
        console.log('desperado depenalty!');
        $('#desperadoStatus').hide();
        // Player stun-animation stop
        // Desperado.destun();
    };

    const dead = function() {
        // Cowboy.dead();
    };


    return {initialize, play, reload, shoot, damaged, penalize, depenalize, dead};
})();

const GameScreen = (function() {
    const initialize = function() {};


    const displayRoundStart = function(roundNum) {
        // Play animation
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

    const displayGameStat = function(kdaStat, timeStat) {
        // display stats
        
    }


    return {initialize, displayShowdown, displayRoundStart, displayRoundWinner, gameWin, gameLost, displayGameStat};
}
)();



const UI = (function() {
    // This function initializes the UI
    const initialize = function() {
        // Initialize the components
        const components = [Player, Desperado, Sound, Cowboy, Desperado, Heart];
        for (const component of components) {
            component.initialize();
        }
    };

    return { initialize };
})();