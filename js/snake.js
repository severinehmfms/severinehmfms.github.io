const canvas = document.getElementById("game");
const context = canvas.getContext("2d");

const restartButton = document.getElementById("restart");

let score;
let gameOver;
let snake = [];
let food = {};
let direction;

//On initialise la partie
initGame();

//On dessine le serpent
drawSnake();

//On ajoute un évènement sur le bouton restart
restartButton.addEventListener("click", function() {

    //On initialise la partie
    initGame();

    //On met à jour le score (à 0)
    document.getElementById("score").textContent = score;

    //On génère la nourriture
    generateFood();

    //On affiche tout :-)
    draw();
});

/*
//On ajoute un évènement sur les touches du clavier, pour changer la direction du serpent
document.addEventListener("keydown", function(event) {

    //On rajoute une sécurité pour éviter le bug si on veut faire revenir le serpent sur lui même ! 
    if (event.key === "ArrowUp" && direction !== "DOWN") {
        direction = "UP";
    }

    if (event.key === "ArrowDown" && direction !== "UP") {
        direction = "DOWN";
    }

    if (event.key === "ArrowLeft" && direction !== "RIGHT") {
        direction = "LEFT";
    }

    if (event.key === "ArrowRight" && direction !== "LEFT") {
        direction = "RIGHT";
    }

});*/


/**
 * Change la direction du serpent
 * sans lui permettre de faire demi-tour.
 */
function changeDirection(newDirection) {

    if (newDirection === "UP" && direction !== "DOWN") {
        direction = "UP";
    } else if (newDirection === "DOWN" && direction !== "UP") {
        direction = "DOWN";
    } else if (newDirection === "LEFT" && direction !== "RIGHT") {
        direction = "LEFT";
    } else if (newDirection === "RIGHT" && direction !== "LEFT") {
        direction = "RIGHT";
    }
}

// Commandes au clavier sur ordinateur
document.addEventListener("keydown", function(event) {

    const keys = {
        ArrowUp: "UP",
        ArrowDown: "DOWN",
        ArrowLeft: "LEFT",
        ArrowRight: "RIGHT"
    };

    if (keys[event.key]) {
        event.preventDefault();
        changeDirection(keys[event.key]);
    }
});

// Commandes tactiles sur smartphone
document.getElementById("up").addEventListener("click", function() {
    changeDirection("UP");
});

document.getElementById("down").addEventListener("click", function() {
    changeDirection("DOWN");
});

document.getElementById("left").addEventListener("click", function() {
    changeDirection("LEFT");
});

document.getElementById("right").addEventListener("click", function() {
    changeDirection("RIGHT");
});



//Toutes les 150 ms, on appelle la fonction qui fait bouger le serpent puis celle qui l'affiche
setInterval(function () {

    //Si la partie n'est pas finie
    if (!gameOver) {

        moveSnake();
        draw();
    }

}, 150);

//Initialise la partie
function initGame(){
    score = 0;

    gameOver = false;

    //On définit l'emplacement de base du serpent
    snake = [
        { x: 100, y: 200 },
        { x: 80, y: 200 },
        { x: 60, y: 200 }
    ];

    //On définit l'emplacement de base de la nourriture
    food = {
        x: 100,
        y: 100
    };

    //On choisit la direction de base
    direction = "RIGHT";
}


//Fonction qui efface l'ancien dessin et appelle la fonction pour dessiner le nouveau serpent et la nourriture
function draw() {

    //On efface le canvas
    context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // On dessine le quadrillage en premier
    drawGrid();

    //On dessine le serpent
    drawSnake();
    //On dessine la nourriture
    drawFood();

    if (gameOver) {
        context.fillStyle = "black";
        context.font = "30px Arial";
        context.fillText(
            "GAME OVER",
            120,
            200
        );
    }
}

//Fonction qui dessine la grille
function drawGrid() {
    context.strokeStyle = "#dddddd"; // Gris très léger
    context.lineWidth = 0.5;

    // Lignes verticales
    for (let x = 20; x < canvas.width; x += 20) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
        context.stroke();
    }

    // Lignes horizontales
    for (let y = 20; y < canvas.height; y += 20) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(canvas.width, y);
        context.stroke();
    }
}

//Fonction qui dessine la nourriture
function drawFood() {

    context.fillStyle = "red";

    context.fillRect(
        food.x,
        food.y,
        20,
        20
    );
}

//Fonction qui dessine le serpent normalement
function drawSnakeOld() {

    context.fillStyle = "green";

    for (let part of snake) {

        context.fillRect(
            part.x,
            part.y,
            20,
            20
        );
    }
}

//Fonction qui dessine le serpent avec un petit trait blanc
function drawSnake() {
    context.fillStyle = "green";
    context.strokeStyle = "white";
    context.lineWidth = 1;

    for (let part of snake) {
        context.fillRect(
            part.x,
            part.y,
            20,
            20
        );

        // Léger contour blanc autour de chaque case
        context.strokeRect(
            part.x,
            part.y,
            20,
            20
        );
    }
}

//Fonction qui déplace le serpent
function moveSnake() {

    let head = snake[0];

    let newHead = {
        x: head.x,
        y: head.y
    };

    if (direction === "RIGHT") {
        newHead.x += 20;
    }

    if (direction === "LEFT") {
        newHead.x -= 20;
    }

    if (direction === "UP") {
        newHead.y -= 20;
    }

    if (direction === "DOWN") {
        newHead.y += 20;
    }

    //Si le serpent se cogne au mur ou sur lui même la partie est terminée.
    if (
        checkWallCollision(newHead) ||
        checkSelfCollision(newHead)
    ) {
        gameOver = true;
        return;
    }

    //On ajoute la nouvelle tête en haut du tableau (donc agrandit le serpent)
    snake.unshift(newHead); 
    
    //Si les coordonnées de la nouvelle tête correspondent à celle de la nourriture, on génère une nouvelle nourriture 
    //On ne retire pas la dernière case du serpent
    if (newHead.x === food.x && newHead.y === food.y) {
        score++;
        document.getElementById("score").textContent = score;
        generateFood();

    } else {

        //On supprime la dernière case du serpent : Supprime le dernier élément du tableau
        snake.pop(); 
    }

}

//Fonction qui génère de façon aléatoire la nourriture (coordonnées x et y du pixel représentant la nourriture)
function generateFood() {

    food.x = Math.floor(Math.random() * 20) * 20;
    food.y = Math.floor(Math.random() * 20) * 20;
}

//Pour gérer les collisions avec les murs
//Retourne true si il cogne un mur, false sinon
function checkWallCollision(head) {

    return (
        head.x < 0 ||
        head.x >= canvas.width ||
        head.y < 0 ||
        head.y >= canvas.height
    );
}

//Pour gérer les collisions avec lui même
//Retourne true si il se cogne lui même, false sinon
function checkSelfCollision(head) {

    for (let i = 1; i < snake.length; i++) {

        if (
            head.x === snake[i].x &&
            head.y === snake[i].y
        ) {
            return true;
        }
    }

    return false;
}