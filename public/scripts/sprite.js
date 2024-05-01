const Sprite = function(ctx, x, y) {
    const sheet = new Image();

    // This is an object containing the sprite sequence information used by the sprite containing:
    // - `x` - The starting x position of the sprite sequence in the sprite sheet
    // - `y` - The starting y position of the sprite sequence in the sprite sheet
    // - `width` - The width of each sprite image
    // - `height` - The height of each sprite image
    // - `count` - The total number of sprite images in the sequence
    // - `timing` - The timing for each sprite image
    // - `loop` - `true` if the sprite sequence is looped
    let sequence = { x: 0, y: 0, width: 64, height: 64, count: 1, timing: 0, loop: false };

    // This is the index indicating the current sprite image used in the sprite sequence.
    let index = 0;

    // This is the scaling factor for drawing the sprite.
    let scale = 1;

    // This is the updated time of the current sprite image.
    // It is used to determine the timing to switch to the next sprite image.
    let lastUpdate = 0;

    let visible = true;
    let opacity = 1;

    const getSequcnce = function() {
        return sequence;
    }

    // This function uses a new sprite sheet in the image object.
    // - `spriteSheet` - The source of the sprite sheet (URL)
    const useSheet = function(spriteSheet) {
        sheet.src = spriteSheet;
        return this;
    };

    // This function returns the readiness of the sprite sheet image.
    const isReady = function() {
        return sheet.complete && sheet.naturalHeight != 0;
    };

    // This function gets the current sprite position.
    const getXY = function() {
        return {x, y};
    };

    // This function sets the sprite position.
    // - `xvalue` - The new x position
    // - `yvalue` - The new y position
    const setXY = function(xvalue, yvalue) {
        [x, y] = [xvalue, yvalue];
        return this;
    };

    // This function sets the scaling factor of the sprite.
    // - `value` - The new scaling factor
    const setScale = function(value) {
        scale = value;
        return this;
    };

    // This function sets the sprite position.
    // - `newSequence` - The new sprite sequence to be used by the sprite
    const setSequence = function(newSequence) {
        sequence = newSequence;
        // if (sequence == undefined) {
        //     console.log('Sequence is undefined')
        // } else {
        //     console.log(sequence)
        // }
        index = 0;
        lastUpdate = 0;
        return this;
    };

    // This function sets the scaling factor of the sprite ??

    // This function gets the display size of the sprite.
    const getDisplaySize = function() {
        return { width: sequence.width * scale, height: sequence.height * scale };
    };

    const move = function(dx, dy) {
        x += dx;
        y += dy;
        return this;
    };

    const setVisible = function(isVisible) {
        visible = isVisible;
        return this;
    };

    const setOpacity = function(newOpacity) {
        opacity = newOpacity;
        return this;
    }

    // This function draws the sprite.
    const draw = function(flip = false) {
        if (isReady() && visible) {
            // drawSprite(flip);
            ctx.save();
            ctx.globalAlpha = opacity;

            const size = getDisplaySize();

            if (flip) {
                ctx.scale(-1, 1);
                ctx.translate(-x*2 - size.width, 0);
            }

            /* Draw the sprite */
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(
                sheet,
                sequence.x + sequence.width * index, 
                sequence.y,
                sequence.width, 
                sequence.height,
                x, 
                y,
                size.width, 
                size.height
            );

            ctx.restore();
        }
        return this;
    }

    // This function updates the sprite.
    const update = function(time) {

        if (lastUpdate == 0) lastUpdate = time;

        if (time - lastUpdate >= sequence.timing) {
            index += 1;
            if (index >= sequence.count) {
                if (sequence.loop) {
                    index = 0;
                } else {
                    index -= 1;
                }
            }
            lastUpdate = time;
        }

        return this;
    }

    // The methods are returned as an object here.
    return {
        useSheet: useSheet,
        getXY: getXY,
        setXY: setXY,
        setSequence: setSequence,
        setScale: setScale,
        // setShadowScale: setShadowScale,
        getDisplaySize: getDisplaySize,
        // getBoundingBox: getBoundingBox,
        isReady: isReady,
        draw: draw,
        update: update,
        move: move,
        setVisible: setVisible,
        setOpacity: setOpacity,
        getSequence: getSequcnce
    };

}