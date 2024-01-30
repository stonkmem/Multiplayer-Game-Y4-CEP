let ball;
let currentRoomCode = null;

const socket = io.connect("ws://localhost:8001");
let em = new EntityManager();
function setup() {
	new Canvas("fullscreen");

	ball = new Sprite();
	ball.diameter = 50;
        // p5play draws over our draw() loop, so we
    // have to jump thru hoops to draw our text
    // over our sprites...... by making a another
    // sprite. wow.
    let text_layer = new Sprite();
    text_layer.visible = false;
    text_layer.collider = "none";
    text_layer.update = () => {
        textAlign(CENTER, CENTER);
        textSize(32);
        text(`Room Code: ${currentRoomCode}`, 0, 50, width, 50);
    };
}

window.onload = () => {
    const join_option_input = prompt('Select: "CREATE" or "JOIN"', "CREATE");
    if (join_option_input === "CREATE") {
        socket.emit("requestCreateRoom");
    } else if (join_option_input === "JOIN") {
        const room_code_input = prompt("Enter Room Code");
        socket.emit("requestJoinRoom", room_code_input);
    } else {
        window.onload();
    }
};

socket.on("setRoomCode", (code) => {
    currentRoomCode = code;
});

function draw() {
	background('grey');
	move();
	socket.emit("position", ball.pos.x, ball.pos.y);
    if (!currentRoomCode) {
        allSprites.visible = false;
        push();
        background("white");
        textSize(32);
        textAlign(CENTER, CENTER);
        text("Room Not Found", 0, 0, width, height);
        pop();
        return;
    }
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