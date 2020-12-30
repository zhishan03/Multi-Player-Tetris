class ConnectionManager
{
    constructor(tetrisManager)
    {
        this.conn = null;
        this.peers = new Map;
        this.tetrisManager = tetrisManager;
        this.localTetris = [...tetrisManager.instances][0];
    }

    connect(address)
    {
        // create a new websocket
        this.conn = new WebSocket(address);

        // get called once the connection get established
        this.conn.addEventListener('open', () => {
            console.log('Connection established');
            this.initSession();
            this.watchEvents();
        });

        this.conn.addEventListener('message', event => {
            console.log('Received message', event.data);
            this.receive(event.data);
        });
    }

    initSession()
    {
        // get everything after the hash
        const sessionId = window.location.hash.split('#')[1];
        const state = this.localTetris.serialize();
        if (sessionId) {
            this.send({
                type: 'join-session',
                id: sessionId,
                state,
            });
        } else {
            // request from the client side to create a room on the server
            this.send({
                type: 'create-session',
                state,
            });
        }
    }


    receive(msg)
    {
        const data = JSON.parse(msg);
        if (data.type === 'session-created') {
            window.location.hash = data.id;
        } else if (data.type === 'session-broadcast') {
            this.updateManager(data.peers);
        } else if (data.type === 'state-update') {
            this.updatePeer(data.clientId, data.fragment, data.state);
        }
    }

    watchEvents()
    {
        const local = this.localTetris;

        const player = local.player;
        ['pos', 'matrix', 'score'].forEach(prop => {
            player.events.listen(prop, value => {
                this.send({
                    type: 'state-update',
                    fragment: 'player',
                    state: [prop, value]
                });
            });
        });
        
        const arena = local.arena;
        ['matrix'].forEach(prop => {
            arena.events.listen(prop, value => {
                this.send({
                    type: 'state-update',
                    fragment: 'arena',
                    state: [prop, value]
                });
            });
        });
    }

    updatePeer(id, fragment, [prop, value]) {
        if (!this.peers.has(id)) {
            console.error('Client does not exist', id);
            return;
        }

        const tetris = this.peers.get(id);
        tetris[fragment][prop] = value;

        if (prop === 'score') {
            tetris.updateScore(value);
        } else {
            tetris.draw();
        }
    }

    updateManager(peers) {
        const me = peers.you;
        // filter out the client from all the players
        const clients = peers.clients.filter(client => me !== client.id);
        clients.forEach(client => {
            if (!this.peers.has(client.id)) {
                const tetris = this.tetrisManager.createPlayer();
                tetris.unserialize(client.state);
                this.peers.set(client.id, tetris);
            }
        });

        // iterate over the peers
        [...this.peers.entries()].forEach(([id, tetris]) => {
            if (!clients.some(client => client.id === id)) {
                this.tetrisManager.removePlayer(tetris);
                this.peers.delete(id);
            }
        });

        const sorted = peers.clients.map(client => {
            this.peers.get(client.id) || this.localTetris;
        });

        this.tetrisManager.sortPlayers(sorted);
    }

    send(data) 
    {
        const msg = JSON.stringify(data);
        console.log(`Sending message ${msg}`);
        this.conn.send(msg);
    }
}