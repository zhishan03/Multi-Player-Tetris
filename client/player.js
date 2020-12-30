class Player
{
    constructor(tetris)
    {   
        this.DROP_SLOW = 1000;
        this.DROP_FAST = 50;

        this.events = new Events();

        this.tetris = tetris;
        this.arena = tetris.arena;

        this.dropCounter = 0;
        this.dropInterval = this.DROP_SLOW;

        this.pos = {x:0, y:0};
        this.matrix = null;
        this.score = 0;

        this.reset();
    }

    createPiece(type) {
        // 'T' piece
        if (type === 'T') {
            return [
                [0, 0, 0],
                [1, 1, 1],
                [0, 1, 0],
            ];
        } 
        // 'O' piece
        else if (type === 'O') {
            return [
                [2, 2],
                [2, 2],
            ];
        } 
        // 'L' piece
        else if (type === 'L') {
            return [
                [0, 3, 0], 
                [0, 3, 0],
                [0, 3, 3],
            ];
        }
        // 'J' piece
        else if (type === 'J') {
            return [
                [0, 4, 0],
                [0, 4, 0],
                [4, 4, 0],
            ];
        }
        // 'I' piece
        else if (type === 'I') {
            return [
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
            ];
        }
        // 'S' piece
        else if (type === 'S') {
            return [
                [0, 6, 6],
                [6, 6, 0],
                [0, 0, 0],
            ];
        }
        // 'Z' piece
        else if (type === 'Z') {
            return [
                [7, 7, 0],
                [0, 7, 7],
                [0, 0, 0],
            ];
        }
    }

    move(dir) 
    {
        this.pos.x += dir;
        // if collide, we move back
        if(this.arena.collide(this)) {
            this.pos.x -= dir;
            return;
        }
        this.events.emit('pos', this.pos);
    }

    reset() 
    {
        const pieces = 'TJLOSZI';
        // create a piece randomly
        this.matrix = this.createPiece(pieces[pieces.length * Math.random() | 0]);
        this.pos.y = 0;
        // put the piece in the middle of x axis
        this.pos.x = (this.arena.matrix[0].length / 2 | 0) -
                       (this.matrix[0].length / 2 | 0);
    
        // if the top row is filled up
        if (this.arena.collide(this)) {
            this.arena.clear();
            this.score = 0;
            this.events.emit('score', this.score);
        }
        this.events.emit('pos', this.pos);
        this.events.emit('matrix', this.matrix);
    }

    rotate(dir) 
    {
        const pos = this.pos.x;
        let offset = 1;
        this._rotateMatrix(this.matrix, dir);
        while (this.arena.collide(this)) {
            this.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            // bail in case it didn't work
            if (offset > this.matrix[0].length) {
                this._rotateMatrix(this.matrix, -dir);
                this.pos.x = pos;
                return;
            }
        }
        this.events.emit('matrix', this.matrix);
    }

    _rotateMatrix(matrix, dir)
    {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [
                    matrix[x][y],
                    matrix[y][x],
                ] = [
                    matrix[y][x],
                    matrix[x][y],
                ];
            }
        }

        if (dir > 0) {
            matrix.forEach(row => row.reverse());
        } else {
            matrix.reverse();
        }
    }
    
    drop() 
    {
        this.pos.y++;
        // if we collide
        this.dropCounter = 0;
        if (this.arena.collide(this)) {
            this.pos.y--;
            // merge with the arena
            this.arena.merge(this);
            this.reset();
            // sweep returns the new gained score
            this.score += this.arena.sweep();
            // call updateScore to update score
            this.events.emit('score', this.score);
            return;
        }
        this.events.emit('pos', this.pos);
    }

    update(deltaTime)
    {
        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) {
            this.drop();
        }
    }
}