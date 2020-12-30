class Tetris
{
    constructor(element)
    {   
        this.element = element;
        this.canvas = element.querySelector('canvas');
        this.context = this.canvas.getContext('2d');
        this.context.scale(20, 20);

        // create a 12 by 20 matrix
        this.arena = new Arena(12, 20);

        // create a new player
        this.player = new Player(this);

        this.player.events.listen('score', score => {
            this.updateScore(score);
        });

        this.colors = [
            null,
            '#cd5d7d',
            '#f6ecf0',
            '#a7c5eb',
            '#949cdf',
            '#83a95c',
            '#ffd66b',
            '#dff3e3',
        ];

        // requestAnimationFrame: to update the animation onscreen
        let lastTime = 0;

        // Arrow function
        this._update = (time = 0) => {
            const deltaTime = time - lastTime;
            lastTime = time;

            this.player.update(deltaTime);

            this.draw();
            requestAnimationFrame(this._update);
        };

        this.updateScore(0);
    }

    draw() {
        this.context.fillStyle = '#000';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // draw arena
        this.drawMatrix(this.arena.matrix, {x:0, y:0});
        this.drawMatrix(this.player.matrix, this.player.pos);
    }
    
    // offset to move the piece
    drawMatrix(matrix, offset) {
    // y is row number and x is column number
        matrix.forEach((row,y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.context.fillStyle = this.colors[value];
                    this.context.fillRect(x + offset.x, 
                                     y + offset.y, 1, 1);
                }
            });
        });
    }

    run() {
        this._update();
    }

    // store the gamestate
    serialize()
    {
        return {
            arena: {
                matrix: this.arena.matrix,
            },
            player: {
                matrix: this.player.matrix,
                pos: this.player.pos,
                score: this.player.score,
            },
        };
    }

    unserialize(state)
    {
        this.arena = Object.assign(state.arena);
        this.player = Object.assign(state.player);
        this.updateScore(this.player.score);
        this.draw();
    }

    updateScore(score) 
    {
        this.element.querySelector('.score').innerText = `Your Current Score: ${score}`;
    }

}