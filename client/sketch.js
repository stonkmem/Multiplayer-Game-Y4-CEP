let ball;

const socket = io.connect("ws://localhost:8001");
let em = new EntityManager();
function setup() {
	new Canvas("fullscreen");

	ball = new Sprite();
	ball.diameter = 50;
}

function draw() {
	background('grey');
	move();
	socket.emit("position", ball.pos.x, ball.pos.y);
}

function move() {
    const SPEED = 10;
    if (kb.pressing("w")) {
        ball.pos.y -= SPEED;
    }
    if (kb.pressing("a")) {
        ball.pos.x -= SPEED;
    }
    if (kb.pressing("s")) {
        ball.pos.y += SPEED;
    }
    if (kb.pressing("d")) {
        ball.pos.x += SPEED;
    }
}

socket.on("buildMap", (mapData) => {
    for (const blockData of Object.values(mapData.blocks)) {
        let group = new Group();
        Object.assign(group, blockData);
        new Tiles(
            blockData.tileMap,
            blockData.startX,
            blockData.startY,
            blockData.w,
            blockData.h
        );
    }
});

socket.on("playerDataUpdate", (id, playerData) => {
    for (let data of playerData) {
        if (data.id === id)
            continue;
        if (!em.exists(data.id)) {
            em.registerNewPlayer(data);
        } else {
            em.updatePlayerData(data);
        }
    }
});

socket.on("removeClient", id => {
    let playerData = em.get(id);
    if (playerData) {
        playerData.sprite.remove();
        em.delete(id);
    }
});