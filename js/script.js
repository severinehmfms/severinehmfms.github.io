//Crée une variable cv qui sera accessible en dehors des fonctions
//let cv;

async function loadCV() {

    //response représente la réponse du serveur. Elle contient notamment le contenu de ton fichier JSON.
    //Mais ce contenu n'est pas encore directement utilisable comme objet JavaScript.
    const response = await fetch("data/cv.json");

    //Attends que le JSON soit récupéré et transformé (await), puis stocke le résultat dans une constante appelée cv
    const cv = await response.json();

    //On affiche dans la console le prénom
    console.log(cv.personal.firstName);
    //console.log(cv);

    return cv;
}

async function main() {

    const cv = await loadCV();

    console.log(cv);

    //textContent → récupère/modifie le texte brut
    //innerText → innerText représente davantage le texte visible pour l'utilisateur. (avec les balises)

    //Informations personnelles
    //Cherche dans le HTML l'élément qui possède id="full-name" et on met dedans nom et prénom
    document.getElementById("nom").textContent = `${cv.personal.firstName} ${cv.personal.lastName}`;
    document.getElementById("titre").textContent = cv.personal.jobTitle;

    let lientel = "<img src=\"img/phone.png\" class=\"icone\"/> <a href=\"tel:" + cv.personal.phone + "\"> Me téléphoner </a>";
    document.getElementById("phone").innerHTML = lientel;

    let lienmail = "<img src=\"img/mail.png\" class=\"icone\"/> <a href=\"mailto:" + cv.personal.email + "\"> M'envoyer un mail </a>";
    document.getElementById("email").innerHTML = lienmail;

    let lienadresse = "<img src=\"img/address.png\" class=\"icone\"/>" + cv.personal.city;
    document.getElementById("ville").innerHTML = lienadresse;

    //Partie description
    afficheDescription(cv.profile);

    //Partie compétences
    afficheCompetences(cv.skills);

    //Partie formations
    afficheFormations(cv.education);

    //Partie expériences
    afficheExperiences(cv.experiences);

    //Partie projets
    afficheProjets(cv.projects);

    //Partie langues
    afficheLangues(cv.languages);

    //Partie centres d'intérêts
    afficheInterets(cv.interests);
    
    ajouterBoutonAfficherMasquer(
        document.getElementById("bouton-competences"),
        document.getElementById("competences")
    );

    ajouterBoutonAfficherMasquer(
        document.getElementById("bouton-langues"),
        document.getElementById("langues")
    );

    ajouterBoutonAfficherMasquer(
        document.getElementById("bouton-interets"),
        document.getElementById("interets")
    );

    //Panneau de navigation
    const boutons = document.querySelectorAll(".navigation button");
    const panneaux = document.querySelectorAll(".panneau-menu");

    //Bouton contact désolidarisé des autres
    const boutonContact = document.querySelector(".bouton-contact");

    boutons.forEach(function(bouton) {
        bouton.addEventListener("click", function() {

            const cible = bouton.dataset.cible;

            panneaux.forEach(function(panneau) {
                panneau.classList.remove("actif");
            });

            boutons.forEach(function(b) {
                b.classList.remove("actif");
            });

            document.getElementById(cible).classList.add("actif");
            bouton.classList.add("actif");
        });
    });

    boutonContact.addEventListener("click", function() {

        const contact = document.getElementById("contact");

        if (contact.classList.contains("actif")) {
            contact.classList.remove("actif");
            boutonContact.classList.remove("actif");
        } else {
            contact.classList.add("actif");
            boutonContact.classList.add("actif");
        }

    });
}
//Fonctions pour charger les éléments suivant le type (pour réduire un peu le main)
//Fonction qui met la description dans le sélecteur ayant pour id description
function afficheDescription(profile) {
    const container = document.querySelector("#description");
    container.textContent = profile;
}

//Fonction qui affiche les compétences
function afficheCompetences(skills) {
    //const container = document.getElementById("competences");
    const container = document.querySelector("#competences");

    skills.forEach(function(skill) {

        const element = document.createElement("div");

        //Si on a besoin de rajouter une classe pour le style 
        element.classList.add("skill");

        //element.textContent = skill.name + " - " + skill.level;

        element.innerHTML = `
            <strong>${skill.name}</strong>
            <span>${skill.level}</span>
        `;

        container.appendChild(element);
    });
}

//Fonction qui affiche les formations
function afficheFormations(formations) {
    const container = document.querySelector("#formations");

    formations.forEach(item => {

        const element = document.createElement("article");

        //On va fabriquer le code html pour chaque formation, avec les éléments récupérés du JSON.
        element.innerHTML = `
            

            <div class="titre-formation">
            <h3>${item.degree}</h3>
            <p class="date">
                ${formatDate(item.startDate)}
                    —
                ${formatDate(item.endDate)}
            </p>
            </div>
            ${item.school} - ${item.location}
            <p>${item.description}</p>
        `;

        container.appendChild(element);
    });
}

//Fonction qui affiche les expériences
function afficheExperiences(experiences) {

    const container = document.querySelector("#experiences");

    experiences.forEach(function(experience) {

        const element = document.createElement("article");

        element.innerHTML = `
            <div class="titre-experience">
                <h3>${experience.position}</h3>
                <p class="date">  ${formatDate(experience.startDate)} — ${formatDate(experience.endDate)}  </p>
            </div>
            <p class="company">
                ${experience.company} - ${experience.location} 
            </p>
            <p>${experience.description}</p>
            <div><div class="technologies"></div></div>
        `;

        const technologies = element.querySelector(".technologies");
        technologies.classList.add("blocElements");


        experience.technologies.forEach(function(technology) {
            technologies.innerHTML += `
                <span class="element">${technology}</span>
            `;

        });

        container.appendChild(element);
    });
}

//Fonction qui affiche les projets
function afficheProjets(projets) {

    // On récupère la div qui va contenir tous les projets
    const container = document.querySelector("#projets");

    // On parcourt tous les projets
    projets.forEach(function(project) {

        // On crée un <article> pour chaque projet
        const element = document.createElement("article");

        // On construit le HTML du projet
        element.innerHTML = `
            <h3>${project.name}</h3>

            <p>${project.description}</p>

            <div class="technologies" class="blocElements"></div>
        `;

        // On récupère la div "technologies" que l'on vient de créer (. pour récupérer classe, # pour id)
        const technologies = element.querySelector(".technologies");

        // On parcourt les technologies du projet
        project.technologies.forEach(function(technology) {

            // On ajoute un <span> pour chaque technologie
            technologies.innerHTML += `
                <span class="element">${technology}</span>
            `;

        });

        // On ajoute l'article dans le container #projets
        container.appendChild(element);
    });
}

//Fonction pour afficher les langues
function afficheLangues(langues){
    const container = document.querySelector("#langues");

    //const list = document.createElement("ul");
    const list = document.createElement("div");
    list.classList.add("langues-liste");

    langues.forEach(language => {

        //const item = document.createElement("li");
        const item = document.createElement("div");
        item.classList.add("langue");

        item.innerHTML = `
            <strong>${language.name}</strong>
            <span>${language.level}</span>
        `;

        list.appendChild(item);
    });

    container.appendChild(list);
}

function afficheInterets(interets){
    const container = document.querySelector("#interets");

    interets.forEach(interest => {

        const element = document.createElement("span");

        element.classList.add("element");

        element.textContent = interest;

        container.appendChild(element);
    });
}

//Fonction pour ajouter un bouton afficher/masquer +/- 
function ajouterBoutonAfficherMasquer(bouton, contenu) {
    //On ajoute l'EventListener sur le bouton avec notre fonction comme réponse du click
    bouton.addEventListener("click", function() {
        if (contenu.classList.contains("visible")) {

             // Le contenu est visible → on le rend invisible
            contenu.classList.remove("visible");
            contenu.classList.add("invisible");

            bouton.textContent = "+";
            //Si on veut faire avec une image
            //bouton.src = "plus.png";

        } else {
            // Le contenu est invisible → on le rend visible
            contenu.classList.remove("invisible");
            contenu.classList.add("visible");

            bouton.textContent = "−";
            //Si on veut faire avec une image
            //bouton.src = "moins.png";
        }
    });
}

function formatDate(date) {

    if (!date) {
        return "Aujourd'hui";
    }

    // Si seule l'année est renseignée
    if (!date.includes("-")) {
        return date;
    }

    const [annee, mois] = date.split("-");

    const moisNoms = [
        "Janvier", "Février", "Mars", "Avril",
        "Mai", "Juin", "Juillet", "Août",
        "Septembre", "Octobre", "Novembre", "Décembre"
    ];

    return `${moisNoms[parseInt(mois) - 1]} ${annee}`;
}

main();
