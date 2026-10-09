const canvas = document.getElementById("jeu");
const context = canvas.getContext("2d");

//Mon tetris est composé de cases de 30*30
const CASE = 30;
//Hauteur et largeur de la zone de jeu
const LARGEUR = 300;
const HAUTEUR = 600;
//Nombre de lignes et de colonnes
const NBLIGNES = HAUTEUR / CASE;
const NBCOLONNES = LARGEUR / CASE;
const TIME = 400;
//On définit les différentes formes possibles
const FORME1 =  [
        [1,1,0],
        [1,1,0]
    ];
const FORME2 = [
    [1,0,0],
    [1,1,1]
];
const FORME3 = [
    [1,1,1],
    [0,0,0]
];
const FORME4 = [
    [1,1,1],
    [0,1,0]
];
const FORME5 = [
    [0,0,1],
    [1,1,1]
];

//TODO Voir comment FIXER les couleurs une fois les pièces en bas
const couleurs = {
    1: "#3498DB", // Bleu
    2: "#F1C40F", // Jaune
    3: "#2ECC71", // Vert
    4: "#9B59B6",  // Violet
    5: "#8B1520" //bordeaux
};

const formes = [FORME1, FORME2, FORME3, FORME4, FORME5];

let gameOver = false;
let score = 0;
/*
canvas.addEventListener("pointerdown", function(event) {
    event.preventDefault();

    alert("Le toucher est détecté !");

    // Le reste de ton code reste inchangé
});*/

let magrille = initGrille();

//On crée une nouvelle pièce
let piece = nouvellePiece(formes);



let debutX = 0;
let debutY = 0;
let toucherEnCours = false;

const seuilDeplacement = 10;

// Début du toucher
canvas.addEventListener("pointerdown", function(event) {
    event.preventDefault();

    if (!event.isPrimary) {
        return;
    }

    debutX = event.clientX;
    debutY = event.clientY;
    toucherEnCours = true;

    canvas.setPointerCapture(event.pointerId);
});

// Déplacement du doigt
canvas.addEventListener("pointermove", function(event) {
    event.preventDefault();

    if (!toucherEnCours) {
        return;
    }

    const differenceX = event.clientX - debutX;

    if (Math.abs(differenceX) >= seuilDeplacement) {
        if (differenceX < 0) {
            envoyerTouche("ArrowLeft");
        } else {
            envoyerTouche("ArrowRight");
        }

        // On repart de la nouvelle position du doigt
        debutX = event.clientX;
    }
});

// Fin du toucher
canvas.addEventListener("pointerup", function(event) {
    event.preventDefault();

    if (!toucherEnCours) {
        return;
    }

    const differenceX = event.clientX - debutX;
    const differenceY = event.clientY - debutY;

    toucherEnCours = false;

    // Toucher simple : tourner la pièce
    if (Math.abs(differenceX) < seuilDeplacement &&
        Math.abs(differenceY) < seuilDeplacement) {
        envoyerTouche("ArrowUp");
    }
});

// Geste interrompu
canvas.addEventListener("pointercancel", function() {
    toucherEnCours = false;
});






//On ajoute un évènement sur les touches du clavier
document.addEventListener("keydown", function(event) {
    //Calcul du nombre de lignes par pièce, et nombre de pixels par pièce, mais pour l'instant non utilisé
    //nblignespiece = getNbLignesForme(piece.forme);
    //nblignespiecepixels = nblignespiece * CASE;
    
    nbcolonnespiece = getNbColonnesForme(piece.forme);
    nbcolonnespiecepixels = nbcolonnespiece * CASE;

    //On empêche le fonctionnement par défaut des touches
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
    }

    if (event.key === "ArrowLeft") {
        if (event.key === "ArrowLeft") {
            if (piece.x > 0) {
                piece.x -= CASE;
            }

            draw(piece);
        }
    }

    if (event.key === "ArrowRight") {
        //piece.x = piece.x + CASE > LARGEUR - CASE ? LARGEUR - CASE : piece.x + CASE;
        piece.x = piece.x + CASE < LARGEUR - nbcolonnespiecepixels ? piece.x + CASE : LARGEUR - nbcolonnespiecepixels;

        draw(piece);
    }

    //Touche du haut on fait tourner la pièce 
    if (event.key === "ArrowUp") {
        tournerPiece(piece);

        //quand on fait tourner la pièce elle peut devenir plus large, si elle arrive aux limites alors on la décale
        let largeurPiece = getNbColonnesForme(piece.forme) * CASE;
        if (piece.x + largeurPiece > LARGEUR) {
            piece.x = LARGEUR - largeurPiece;
        }

        draw(piece);
    }

    //Touche du bas on descend plus vite
    if (event.key === "ArrowDown") {
        if (peutDescendre(piece)) {
            piece.y += CASE;
        } else {
            fixerPiece(piece);
            supprimerLignesCompletes();

            piece = nouvellePiece(formes);

            if (!peutPlacerPiece(piece)) {
                gameOver = true;
                alert("Game Over !");
            }
        }

        draw(piece);
    }
    
});


// Réutilise le listener clavier existant
function envoyerTouche(touche) {
    document.dispatchEvent(
        new KeyboardEvent("keydown", {
            key: touche,
            bubbles: true,
            cancelable: true
        })
    );
}

//Pour détecter le gameover (merci chat gpt)
function peutPlacerPiece(piece) {
    for (let i = 0; i < piece.forme.length; i++) {
        for (let j = 0; j < piece.forme[i].length; j++) {
            if (piece.forme[i][j] !== 0 ) {
                let ligne = piece.y / CASE + i;
                let colonne = piece.x / CASE + j;

                if (
                    ligne < 0 || ligne >= NBLIGNES ||
                    colonne < 0 || colonne >= NBCOLONNES ||
                    magrille[ligne][colonne] !== 0
                ) {
                    return false;
                }
            }
        }
    }

    return true;
}

//Toutes les TIME ms
setInterval(function () {
    //Si la partie n'est pas finie
    if (!gameOver) {
        if (peutDescendre(piece)){
            let hauteurpiecepixels = getNbLignesForme(piece.forme) * CASE;        
            //On est plus obligé de faire les vérifications puisqu'on l'a fait dans la fonction peutDescendre
            //piece.y = piece.y < HAUTEUR - hauteurpiecepixels ? piece.y + CASE : HAUTEUR - hauteurpiecepixels;
            piece.y += CASE;
        }else {
            //Si la pièce ne peut plus descendre, on enregistre sa position dans la matrice
            fixerPiece(piece);
            //On supprime les lignes complètes
            supprimerLignesCompletes();
            //On crée une nouvelle pièce
            piece = nouvellePiece(formes);

            // Si la nouvelle pièce ne peut pas se placer, la partie est terminée
            if (!peutPlacerPiece(piece)) {
                gameOver = true;
                alert("Game Over !");
            }
        }
        draw(piece);
    }

}, TIME);


//Fonction qui vérifie si la pièce peut encore descendre (retourne false si arrivée en bas!)
//TODO Il faudra vérifier si il y a pas déjà une pièce à cet endroit! rajouter une condition si une des cases dessous de la matrice contient un 1
/*function peutDescendre(piece) {
    let hauteurPiece = getNbLignesForme(piece.forme);

    // Si la pièce atteint le bas de la grille
    if (piece.y + hauteurPiece * CASE >= HAUTEUR) {
        return false;
    }

    return true;
}*/
//Fonction peutDescendre qui cette fois vérifie la matrice (merci chatgpt)
function peutDescendre(piece) {
    // On parcourt les lignes de la forme courante
    for (let i = 0; i < piece.forme.length; i++) {

        // On parcourt les colonnes de la forme courante
        for (let j = 0; j < piece.forme[i].length; j++) {

            // On ne s'intéresse qu'aux cases occupées par la pièce
            
            if (piece.forme[i][j] !== 0) {

                // Position de cette case dans la grille
                let ligne = piece.y / CASE + i;
                let colonne = piece.x / CASE + j;

                // Position de la case située juste en dessous
                let ligneDessous = ligne + 1;

                // Si on dépasse le bas de la grille
                if (ligneDessous >= NBLIGNES) {
                    return false;
                }

                // Si la case située en dessous est déjà occupée
                if (magrille[ligneDessous][colonne] !== 0) {
                    return false;
                }
            }
        }
    }

    // Aucune collision détectée : la pièce peut descendre
    return true;
}

//Fonction pour la rotation des pièces (merci chatgpt)
//Nouvelle fonction tourner pièce qui vérifie si ça va provoquer une collision
function tournerPiece(piece) {
    let ancienneForme = piece.forme;
    let nbLignes = ancienneForme.length;
    let nbColonnes = ancienneForme[0].length;
    let nouvelleForme = [];

    // Rotation de 90° vers la droite
    for (let j = 0; j < nbColonnes; j++) {
        nouvelleForme[j] = [];

        for (let i = nbLignes - 1; i >= 0; i--) {
            nouvelleForme[j].push(ancienneForme[i][j]);
        }
    }

    // Supprimer les lignes entièrement vides
    nouvelleForme = nouvelleForme.filter(
        ligne => ligne.some(valeur => valeur === 1)
    );

    // Supprimer les colonnes entièrement vides
    let colonnesNonVides = [];

    for (let j = 0; j < nouvelleForme[0].length; j++) {
        if (nouvelleForme.some(ligne => ligne[j] === 1)) {
            colonnesNonVides.push(j);
        }
    }

    nouvelleForme = nouvelleForme.map(ligne =>
        colonnesNonVides.map(j => ligne[j])
    );

    // Tester la nouvelle forme
    piece.forme = nouvelleForme;

    let largeur = getNbColonnesForme(piece.forme) * CASE;

    if (piece.x + largeur > LARGEUR) {
        piece.x = LARGEUR - largeur;
    }

    if (!peutPlacerPiece(piece)) {
        piece.forme = ancienneForme;
    }
}
/*
//Fonction qui fait tourner une pièce
function tournerPiece(piece) {
    let ancienneForme = piece.forme;
    let nbLignes = ancienneForme.length;
    let nbColonnes = ancienneForme[0].length;

    let nouvelleForme = [];

    for (let j = 0; j < nbColonnes; j++) {
        nouvelleForme[j] = [];

        for (let i = nbLignes - 1; i >= 0; i--) {
            nouvelleForme[j].push(ancienneForme[i][j]);
        }
    }

    // On remplace l'ancienne forme par la nouvelle
    piece.forme = nouvelleForme;
}*/

//Fonction qui fixe la pièce dans la grille
function fixerPiece(piece) {
    //On parcoure la pièce, les lignes
    for (let i = 0; i < piece.forme.length; i++) {
        //Puis les colonnes
        for (let j = 0; j < piece.forme[i].length; j++) {

            //Si on a 1 à cette position pour cette forme on l'inscrit dans la grille
            if (piece.forme[i][j] === 1) {
                let ligne = piece.y / CASE + i;
                let colonne = piece.x / CASE + j;

                //magrille[ligne][colonne] = 1;
                //Au lieu de stocker 1 pour occupée, on stoke l'id de la couleur
                magrille[ligne][colonne] = piece.couleurId;
            }
        }
    }
}

//Fonction qui supprimer les lignes complètes (merci chatgpt) et on calcule le score
function supprimerLignesCompletes() {
    let nbLignesSupprimees = 0;
    // On parcourt les lignes de bas en haut
    for (let i = NBLIGNES - 1; i >= 0; i--) {
        // On vérifie si toute la ligne est remplie
        let ligneComplete = magrille[i].every(
            caseGrille => caseGrille !== 0
        );

        if (ligneComplete) {
             // On supprime la ligne complète
            magrille.splice(i, 1);
            // On ajoute une nouvelle ligne vide en haut
            magrille.unshift(new Array(NBCOLONNES).fill(0));

            nbLignesSupprimees++;

             // On vérifie à nouveau cette ligne,
            // car les lignes du dessus sont descendues
            i++;
        }
    }

    // Barème classique de Tetris
    const points = [0, 100, 300, 500, 800];
    score += points[nbLignesSupprimees];

    document.getElementById("score").textContent = score;
}

//Fonction qui envoie une nouvelle pièce
function nouvellePiece(formes){
    //On calcule de façon aléatoire la forme de la pièce parmi les formes disponibles dans le tableau
    let indiceAleatoire = Math.floor(Math.random() * formes.length);
    let formechoisie = formes[indiceAleatoire];

    //On crée un objet pièce avec coordonnées x et y, et une taille
    let piece = {
        x: 0,
        y: 0,
        taille: CASE,
        forme: formechoisie,
        couleurId: indiceAleatoire + 1,
        couleur: couleurs[indiceAleatoire + 1]
    };

    //On calcule de façon aléatoire la coordonnée x de la pièce (entre 0 et 300, multiple de 30)
    //On cherche un nombre aléatoire entre 0 et 10 puis on le multiplie par la taille de la case (merci chatgpt)
    //let coordX = Math.floor(Math.random() * 10 ) * CASE;
    let largeurPiece = getNbColonnesForme(piece.forme) * CASE;
    let nbPositionsPossibles = (LARGEUR - largeurPiece) / CASE + 1;
    let coordX = Math.floor(Math.random() * nbPositionsPossibles) * CASE;
    piece.x = coordX;
    return piece;
}

//Fonction qui calcule le nombre de colonnes réel que prend une forme
function getNbColonnesForme(forme){
    let idmaxavecun = 0;
    for (let i = 0; i < forme.length ; i++){
        for (let j = 0; j < forme[i].length ; j++){
            if (forme[i][j] == 1){
                if (j > idmaxavecun) idmaxavecun = j;
            }            
        }
    }
    return idmaxavecun+1;
}

//Fonction qui calcule le nombre de lignes réel que prend une forme
function getNbLignesForme(forme){
    let idmaxavecun = 0;
    for (let i = 0; i < forme.length ; i++){
        for (let j = 0; j < forme[i].length ; j++){
            if (forme[i][j] == 1){
                if (i > idmaxavecun) idmaxavecun = i;
            }            
        }
    }
    return idmaxavecun+1;
}

//Fonction qui initialise la matrice qui va représenter la grille
function initGrille(){
    //On va créer la matrice qui représente la grille, pour l'instant remplie de 0    
    let grille = [];
    //On parcoure les lignes 
    for (let i=0; i<NBLIGNES; i++) {
        // On crée une nouvelle ligne
        grille[i] = [];
        //On parcoure les colonnes 
        for (let j=0; j<NBCOLONNES; j++) {
            //On met un 0 dans la case du tableau à deux dimensions 
            grille[i][j] = 0;
        }
    }
    return grille;
}

//Fonction qui dessine la grille du tetris
function afficheGrille(){
    //On va afficher une grille de 10 colonnes et 20 lignes
    let x = 0;
    let y = 0;
    //On parcoure les lignes 
    while (x < LARGEUR) {
        console.log(x);
        //On parcoure les colonnes 
        while (y < HAUTEUR){
            //On dessine la case
            context.strokeRect(x, y, CASE, CASE);        
            y = y + CASE;
        }
        y = 0;
        x = x + CASE;
    }
}

//Fonction qui dessine la grille du tetris remplie
function afficheGrilleRemplie() {
    for (let i = 0; i < NBLIGNES; i++) {
        for (let j = 0; j < NBCOLONNES; j++) {

            // Une case est occupée si sa valeur n'est pas 0
            if (magrille[i][j] !== 0) {
                context.fillStyle = couleurs[magrille[i][j]];

                context.fillRect(
                    j * CASE,
                    i * CASE,
                    CASE,
                    CASE
                );
            }
        }
    }
}


//Fonction qui dessine une pièce
function drawPiece(piece) {    
    //Couleur qui sera utilisée pour la pièce 
    //context.fillStyle = "rgb(200, 0, 0)";
    context.fillStyle = piece.couleur;

    //On récupère la forme de la pièce, et on va afficher la bonne forme
    //context.fillRect(piece.x, piece.y, piece.taille, piece.taille);
    for (let i = 0; i < piece.forme.length ; i++){
        for (let j = 0; j < piece.forme[i].length ; j++){
            if (piece.forme[i][j] == 1){
                context.fillRect(piece.x + (j*CASE), piece.y + (i*CASE), CASE, CASE);
            }            
        }
    }

    context.lineWidth = 3;
    context.strokeStyle = "grey";
    //context.strokeRect(20, 10, 30, 30);
    //strokeRect dessine un contour rectangulaire non rempli
    //strokeRect(x, y, largeur, hauteur)
}

function draw(piece){
    //On efface toute la grille
    context.clearRect(0, 0, LARGEUR, HAUTEUR);

    //On réaffiche la grille
    //afficheGrille();
    afficheGrilleRemplie(magrille);

    //On affiche la pièce 
    drawPiece(piece)
}
