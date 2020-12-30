class TetrisManager
{
    constructor(document) 
    {
        this.document = document;

        this.template = document.getElementById('player-template');

        this.instances = new Set;

        const playerElements = document.querySelectorAll('.player');
        [...playerElements].forEach(element => {
            const tetris = new Tetris(element);
            this.instances.push(tetris);
        });
    }

    createPlayer()
    {
        const element = this.document
            .importNode(this.template.content, true)
            .children[0];

        const tetris = new Tetris(element);
        this.instances.add(tetris);

        // put the new tetris at the end of the dom
        this.document.body.appendChild(tetris.element);

        return tetris;
    }

    removePlayer(tetris)
    {
        // remove it from instances
        this.instances.delete(tetris);
        // remove it from the dom
        this.document.body.removeChild(tetris.element);
    }

    sortPlayers(tetri)
    {
        tetri.forEach(tetris => {
            this.document.body.appendChild(tetris.element);
        });
    }
}