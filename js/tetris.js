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
//Vitesse
const TEMPS_INITIAL = 400;
const TEMPS_MINIMUM = 100;
const POINTS_PAR_NIVEAU = 500;
const REDUCTION_PAR_NIVEAU = 50;
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

//Voir comment FIXER les couleurs une fois les pièces en bas
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

let enPause = false;
let minuterie = null;

let magrille = initGrille();

//On crée une nouvelle pièce
let piece = nouvellePiece(formes);

let nbcolonnespiece;
let nbcolonnespiecepixels;


const boutonPause = document.getElementById("bouton-pause");
const boutonReprendre = document.getElementById("bouton-reprendre");

// Mettre la partie en pause
boutonPause.addEventListener("click", function() {
    if (gameOver || enPause) {
        return;
    }

    enPause = true;

    // Arrêter la chute automatique
    clearTimeout(minuterie);

    // Afficher le bon bouton
    boutonPause.hidden = true;
    boutonReprendre.hidden = false;
});

// Reprendre la partie
boutonReprendre.addEventListener("click", function() {
    if (gameOver || !enPause) {
        return;
    }

    enPause = false;

    // Afficher le bon bouton
    boutonPause.hidden = false;
    boutonReprendre.hidden = true;

    // Relancer la chute automatique
    minuterie = setTimeout(
        descendreAutomatiquement,
        tempsSelonScore()
    );
});


/* Commandes tactiles avec les quatre boutons */
/*document.querySelectorAll(".bouton-direction").forEach(function(bouton) {

    bouton.addEventListener("pointerdown", function(event) {
        event.preventDefault();

        const touche = bouton.dataset.touche;
        envoyerTouche(touche);
    });

});*/
document.querySelectorAll(".bouton-direction").forEach(function(bouton) {

    bouton.addEventListener("pointerdown", function(event) {
        event.preventDefault();

        // Si c'est le bouton de descente rapide
        if (bouton.dataset.action === "hard-drop") {
            if (!enPause && !gameOver) {
                //alert("Appel de descenteRapide");
                descenteRapide();
            }
        } else {
            // Sinon, on utilise le fonctionnement habituel
            const touche = bouton.dataset.touche;
            envoyerTouche(touche);
        }
    });

});

//On ajoute un évènement sur les touches du clavier
document.addEventListener("keydown", function(event) {
    if (enPause || gameOver) {
        return;
    }

    //Calcul du nombre de lignes par pièce, et nombre de pixels par pièce, mais pour l'instant non utilisé
    //nblignespiece = getNbLignesForme(piece.forme);
    //nblignespiecepixels = nblignespiece * CASE;
    
    nbcolonnespiece = getNbColonnesForme(piece.forme);
    nbcolonnespiecepixels = nbcolonnespiece * CASE;

    //On empêche le fonctionnement par défaut des touches
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
    }

    //Rajout d'un contrôle pour corriger le bug "quand ma pièce arrive tout en bas j'arrive à la décaler par exemple vers la gauche et alors elle "rentre" dans une autre pièce déjà fixée"
    if (event.key === "ArrowLeft") {
        // On mémorise la position actuelle
        let anciennePositionX = piece.x;

        // On essaie de déplacer la pièce vers la gauche
        if (piece.x > 0) {
            piece.x -= CASE;
        }

        // Si la nouvelle position provoque une collision,
        // on revient à la position précédente
        if (!peutPlacerPiece(piece)) {
            piece.x = anciennePositionX;
        }

        draw(piece);
    }
    /*
    if (event.key === "ArrowLeft") {
        if (event.key === "ArrowLeft") {
            if (piece.x > 0) {
                piece.x -= CASE;
            }

            draw(piece);
        }
    }*/

    //Rajout d'un contrôle pour corriger le bug "quand ma pièce arrive tout en bas j'arrive à la décaler par exemple vers la gauche et alors elle "rentre" dans une autre pièce déjà fixée"
    if (event.key === "ArrowRight") {
        // On mémorise la position actuelle
        let anciennePositionX = piece.x;

        // On essaie de déplacer la pièce vers la droite
        let largeurPiece = getNbColonnesForme(piece.forme) * CASE;

        if (piece.x + CASE <= LARGEUR - largeurPiece) {
            piece.x += CASE;
        }

        // Si la nouvelle position provoque une collision,
        // on revient à la position précédente
        if (!peutPlacerPiece(piece)) {
            piece.x = anciennePositionX;
        }

        draw(piece);
    }
    /*
    if (event.key === "ArrowRight") {
        //piece.x = piece.x + CASE > LARGEUR - CASE ? LARGEUR - CASE : piece.x + CASE;
        piece.x = piece.x + CASE < LARGEUR - nbcolonnespiecepixels ? piece.x + CASE : LARGEUR - nbcolonnespiecepixels;

        draw(piece);
    }*/

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

        //TODO Voir pour descendre encore plus vite
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

afficherVitesse();

// Lancer la première chute automatique
//setTimeout(descendreAutomatiquement, tempsSelonScore());
minuterie = setTimeout(descendreAutomatiquement, tempsSelonScore());


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

//Fonction qui détermine le temps de descente suivant le score
function tempsSelonScore() {
    const niveau = Math.floor(score / POINTS_PAR_NIVEAU);

    return Math.max(
        TEMPS_MINIMUM,
        TEMPS_INITIAL - niveau * REDUCTION_PAR_NIVEAU
    );
}

//Fonction qui affiche la vitesse 
function afficherVitesse() {
    const niveau = Math.floor(score / POINTS_PAR_NIVEAU) + 1;
    const progression = Math.min(
        100,
        (TEMPS_INITIAL - tempsSelonScore()) /
        (TEMPS_INITIAL - TEMPS_MINIMUM) * 100
    );

    document.getElementById("vitesse").textContent =
        "Niveau " + niveau;

    document.getElementById("progression-vitesse").style.width =
        progression + "%";
}

function descendreAutomatiquement() {
    // Si la partie est terminée, on arrête la chute
    if (gameOver) {
        return;
    }

    //Si la pièce peut encore descendre on la fait descendre
    if (peutDescendre(piece)) {
        piece.y += CASE;
    } else {
        // Fixer la pièce dans la grille
        fixerPiece(piece);

        // Supprimer les lignes complètes et actualiser le score
        supprimerLignesCompletes();

        // Créer une nouvelle pièce
        piece = nouvellePiece(formes);

        // Vérifier si la partie est terminée
        if (!peutPlacerPiece(piece)) {
            gameOver = true;
            alert("Game Over !");
            return;
        }
    }

    // Redessiner le jeu
    draw(piece);

    //Afficher la vitesse
    afficherVitesse();

    // Programmer la prochaine chute avec la vitesse actuelle
    //setTimeout(descendreAutomatiquement, tempsSelonScore());

    minuterie = setTimeout(descendreAutomatiquement, tempsSelonScore());
}

/*
function descenteRapide() {
    //On arrête la minuterie 
    clearTimeout(minuterie);

    // Tant que la pièce peut descendre,
    // on la fait descendre d'une case
    while (peutDescendre(piece)) {
        piece.y += CASE;
    }

    // On fixe la pièce dans la grille
    fixerPiece(piece);

    // On supprime les lignes complètes
    supprimerLignesCompletes();

    // On crée une nouvelle pièce
    piece = nouvellePiece(formes);

    // On vérifie si la partie est terminée
    if (!peutPlacerPiece(piece)) {
        gameOver = true;
        clearTimeout(minuterie);
        alert("Game Over !");
        return;
    }

    // On redessine le jeu
    draw(piece);
    afficherVitesse();

    //On remet la minuterie
    minuterie = setTimeout(descendreAutomatiquement, tempsSelonScore());
}
*/
function descenteRapide() {
    clearTimeout(minuterie);

    // On essaie de descendre de 5 cases maximum
    for (let i = 0; i < 5; i++) {
        if (peutDescendre(piece)) {
            piece.y += CASE;
        } else {
            break;
        }
    }

    // Si la pièce ne peut plus descendre,
    // on la fixe dans la grille
    if (!peutDescendre(piece)) {
        fixerPiece(piece);
        supprimerLignesCompletes();

        piece = nouvellePiece(formes);

        if (!peutPlacerPiece(piece)) {
            gameOver = true;
            alert("Game Over !");
            return;
        }
    }

    draw(piece);
    afficherVitesse();

    minuterie = setTimeout(
        descendreAutomatiquement,
        tempsSelonScore()
    );
}

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
/*
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
*/

//Fonction pour la rotation des pièces (merci chatgpt)
function tournerPiece(piece) {
    let ancienneForme = piece.forme;
    let anciennePositionX = piece.x;

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

    // On essaie la nouvelle forme
    piece.forme = nouvelleForme;

    let largeur = getNbColonnesForme(piece.forme) * CASE;

    // Si la pièce dépasse le bord droit, on la décale
    if (piece.x + largeur > LARGEUR) {
        piece.x = LARGEUR - largeur;
    }

    // On vérifie si la rotation est possible
    if (!peutPlacerPiece(piece)) {
        // La rotation est impossible : on annule tout
        piece.forme = ancienneForme;
        piece.x = anciennePositionX;
    }
}

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

//Efface la grille, affiche la grille, et affiche la pièce
function draw(piece){
    //On efface toute la grille
    context.clearRect(0, 0, LARGEUR, HAUTEUR);

    //On réaffiche la grille
    //afficheGrille();
    afficheGrilleRemplie(magrille);

    //On affiche la pièce 
    drawPiece(piece)
}
