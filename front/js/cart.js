//----recuperation du panier (Local Storage)
let cart = JSON.parse(localStorage.getItem("panier"));

//retourner les caracteristiques du produit de l'API
async function getProductData(id) {
    try {
        //interroger l'api
        let response = await fetch(`http://localhost:3000/api/products/${id}`);
        //convertion de la reponse au format json    
        return await response.json();
        }
    catch (e) {
        alert("Erreur lors de l'appel du serveur " + e);
    };
};

//calcul du recapitulatif
async function totalAmount() {
    //si le panier n'est pas vide
    if (!cart == 0) {
        //nombre d'articles
        let quant = 0;
        //montant total
        let amount = 0;

        //----operations
        for (let item of cart) {
            //quantite s'accumule
            quant += Number(item.quantity);
            
            let data = await getProductData(item.id);
            //calcul du total - prix x quantite
            add = item.quantity * data.price;
            //le prix s'accumule
            amount += add;
        };

        //----injection du rendu dans l'html
        document.getElementById('totalQuantity').innerHTML = quant;
        document.getElementById('totalPrice').innerHTML = amount;
    }
};

//----fonction du message : panier vide
function emptyCart() {
    //on cache la section CART
    document.querySelector('.cart').hidden = true;

    //----affiche un message
    //modifier le Titre
    let title = document.querySelector('h1');
    title.textContent = "Votre panier est vide...";
    title.style.marginBottom = '40px';

    //ajouter un commentaire
    //creer un nouvel element html dans la div #cartAndFormContainer
    const newElt = document.createElement("h2");
    let titleBloc = document.querySelector('#cartAndFormContainer');
    let commentary = titleBloc.appendChild(newElt);
    //edition de l'element
    commentary.textContent = "Retournez voir les articles de notre collection !";
    commentary.style.textAlign = 'center';
    //ajout d'un bouton de retour a la page principale
    const button = document.createElement('button');
    button.type = 'button';
    button.innerHTML = 'Voir les articles';
    button.style.padding = "10px";
    button.style.fontSize = "1EM";
    button.style.color = "var(--main-color)";
    button.style.backgroundColor = "white";
    button.style.fontWeight = "800";
    button.style.borderRadius = "25px";
    titleBloc.style.textAlign = "center";
    //----retour a la page de selection des articles
    button.onclick = function() {
        history.go(-2);
    };

    let container = document.querySelector('#cartAndFormContainer');
    container.appendChild(button);
    //nettoyage du local storage
    localStorage.clear();
}

//----conditions
//si le panier existe
if (JSON.parse(localStorage.getItem("panier"))) {
    if (cart == 0) {
        //cache le formulaire et affiche un message
        emptyCart();

    } else {
        //recalculer quantite et montant
        totalAmount();
    }

    //si le panier n'existe pas
} else if (!JSON.parse(localStorage.getItem("panier"))) {
    //on cree le panier pour envoyer directement
    cart = [];
    localStorage.setItem("panier", JSON.stringify(cart));
    //cache le formulaire et affiche un message
    emptyCart();
}

//----affichage du panier
(async function displayCart() {
    //creation du rendu
    let render = '';
    for(let item of cart) {
        //si la quantite de l'article est entre 1 et 100
        if (item.quantity >= 1 && item.quantity <= 100) {
            //on laisse la quantite intacte
            item.quantity = item.quantity;

        //si la quantite de l'article est superieur a 100
        } else if (item.quantity > 100) {
            //remettre a 100
            item.quantity = 100;
            //envoyer dans le Local Storage
            localStorage.setItem("panier", JSON.stringify(cart));

        //si la quantite de l'article est inferrieur a 1
        } else {
            //remettre a 1
            item.quantity = 1;
            //envoyer dans le Local Storage
            localStorage.setItem("panier", JSON.stringify(cart));
        };

        //rendu html
        let data = await getProductData(item.id);
        let htmlContentItem = `
            <article class="cart__item" data-id="${item.id}" data-color="${item.color}">
                <div class="cart__item__img">
                    <img src="${data.imageUrl}" alt="${data.altTxt}">
                </div>
                <div class="cart__item__content">
                    <div class="cart__item__content__description">
                        <h2>${data.name}</h2>
                        <p>${item.color}</p>
                        <p>${data.price} €</p>
                    </div>
                    <div class="cart__item__content__settings">
                        <div class="cart__item__content__settings__quantity">
                            <p>Qté : </p>
                            <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${item.quantity}">
                        </div>
                        <div class="cart__item__content__settings__delete">
                            <p class="deleteItem">Supprimer</p>
                        </div>
                    </div>
                </div>
            </article>
        `;
        //stocker le rendu en memoire
        render = render + htmlContentItem;
    };
    //injection du rendu dans l'html
    document.getElementById('cart__items').innerHTML = render;

    //----suppression article
    (function delCartItem() {
        //lister le(s)) bouton(s) de suppression
        let delButtons = document.querySelectorAll("p.deleteItem");

        //supprimer l'element cible
        delButtons.forEach(item => {
            item.addEventListener("click", (event) => {
                // bloquer les evenements par defaut
                event.preventDefault();

                //----identifier les elements            
                //pointer l'element a supprimer (element DOM)
                let article = item.closest('article');
                //retourner l'id et color de la cible (element DOM)
                const delId = article.dataset.id;
                const delColor = article.dataset.color;
                //trouver l'index du prodduit (tableau du document)
                //grace a l'id et la couleur
                const index = cart.findIndex(e => e.id === delId && e.color === delColor);

                //Modification du Local Sorage
                //retire du tableau (document)
                cart.splice(index, 1);
                //envoyer dans le Local Storage
                localStorage.setItem("panier", JSON.stringify(cart));

                //si le panier est vide
                if (cart == 0) {
                    //retire le formulaire et affiche un message
                    emptyCart();
                }
                //suppression dans le DOM
                article.remove();
                //recalculer quantite et montant
                totalAmount();
            });
        });
    })();

    //----modifier quantite
    (function modifyCartItem() {
        //lister les inputs de quantite
        let quantButtons = document.querySelectorAll("input.itemQuantity");

        //----modifier l'element cible
        quantButtons.forEach(item => {
            item.addEventListener("change", (event) => {
                //bloquer les evenements par defaut
                event.preventDefault();

                //identifier les elements
                //pointer l'element a modifier (element DOM)
                let article = item.closest('article');
                //retourner l'id et color de la cible (element DOM)
                const quantId = article.dataset.id;
                const quantColor = article.dataset.color;

                //trouver de l'index du prodduit (tableau du document)
                //grace a l'id et de la couleur
                const index = cart.findIndex(e => e.id === quantId && e.color === quantColor);

                //----modification du Local Sorage
                //si la quantite enregistree est comprise entre 1 et 100
                if (item.value >= 1 && item.value <= 100) {
                    //modification du tableau (document)
                    cart[index].quantity = item.value;
                    //envoyer dans le Local Storage
                    localStorage.setItem("panier", JSON.stringify(cart));

                    //recalculer quantite et montant
                    totalAmount();

                    //si la quantite enregistree n'est pas comprise entre 1 et 100
                } else {
                    //message erreur
                    alert("Veuillez indiquer une quantite entre 1 et 100");
                };
            });
        });
    })();
})();

//----valider les donnees

//variables qui permettront la recuperation des valeurs des champs du formulaire
let firstNameInput, lastNameInput, addressInput, cityInput, emailInput;

//modele pour creer des objets liees aux cellules
class cell {
    constructor(element, regex, errorMsg, errorMsgTxt, input) {
        this.title = element,
        this.DOM = document.getElementById(element),
        this.regex = regex,
        this.errorMsg = document.getElementById(errorMsg),
        this.errorMsgTxt = errorMsgTxt,
        this.input = input
    }
};

//prenom
let firstName = new cell('firstName',
//definition de l'expression reguliere
new RegExp("^([a-zA-Z ,.'-]{2,30})+$"),
'firstNameErrorMsg',
"Le prenom doit contenir au moins 2 caracteres et aucun numéro.",
firstNameInput);

//nom
let lastName = new cell('lastName',
//definition de l'expression reguliere
new RegExp("^([a-zA-Z ,.'-]{2,30})+$"),
'lastNameErrorMsg',
"Le nom doit contenir au moins 2 caracteres et aucun numéro.",
lastNameInput);

//adress
let address = new cell('address',
//definition de l'expression reguliere
new RegExp(/^([0-9]{1,6})\s([a-zA-ZÀ-ÿ]{2,12})(\s[a-zA-ZÀ-ÿ]{2,12})?(\s[a-zA-ZÀ-ÿ]{2,12})?\s([a-zA-ZÀ-ÿ]{2,26})(-[a-zA-ZÀ-ÿ]{2,12})?(\s[a-zA-ZÀ-ÿ]{2,12})?([-']{1}[a-zA-ZÀ-ÿ]{2,12})?(\s[a-zA-ZÀ-ÿ]{2,12})?([-']{1}[a-zA-ZÀ-ÿ]{2,12})?$/, 'g'),
'addressErrorMsg',
"L'adresse doit comporter un numero suivit de caracteres.",
addressInput);

//city
let city = new cell('city',
// definition de l'expression reguliere
new RegExp("^([a-zA-Z ,.'-]{2,30})+$"),
'cityErrorMsg',
"La ville doit contenir au moins 2 caracteres et aucun numéro.",
cityInput);

//email
let email = new cell('email',
// definition de l'expression reguliere
new RegExp(/^([a-z0-9._-]+)@([a-z0-9]+)\.([a-z]{2,8})(\.[a-z]{2,8})?$/, 'g'),
'emailErrorMsg',
"L'email ne doit comporter que des chiffres et des lettres minuscules, avec un @.",
emailInput);

//creation d'un tableau pour pouvoir executer une boucle
form = [];
form.push(firstName, lastName, address, city, email);

//----fonction de validation
form.forEach(item => {
    item.DOM.addEventListener('change', (event) => {
        //bloquer les evenements par defaut
        event.preventDefault();
   
        if (item.regex.test(item.DOM.value)) {
            //on affiche un signe d'approbation
            item.errorMsg.textContent = '🗸';
            return item.input = true;
            //si la saisie est incorrecte
        } else {
            //on affiche un message d'erreur
            item.errorMsg.innerHTML = item.errorMsgTxt;
            return item.input = false;
        };
        
    });
});

//----envoi de la saisie

//modele d'objet pour les donnees de contact
class contactInfos {
    constructor(firstName, lastName, address, city, email) {
        this.firstName = firstName,
            this.lastName = lastName,
            this.address = address,
            this.city = city,
            this.email = email
    }
};

//----pointer le bouton de commande (DOM)
const orderButton = document.getElementById('order');


//lorsque le boutton est clique
orderButton.addEventListener('click', (event) => {
    //bloquer les evenements par defaut
    event.preventDefault();

    //----conditions
    //si les valeurs du formulaire sont valides
    if (form[0].input === true && form[1].input === true && form[2].input === true && form[3].input === true && form[4].input === true) {
        
        //creation de l'objet contenant les renseignements
        let contact = new contactInfos(
            //prenom
            form[0].DOM.value,
            //nom de famille
            form[1].DOM.value,
            //adresse
            form[2].DOM.value,
            //ville
            form[3].DOM.value,
            //email
            form[4].DOM.value
        );

        console.dir(contact)

        //Recuperation des id's des produts pour creer un tableau d'id
        let products = [];
        cart.forEach(item => {
            products.push(item.id)
        });

        //requete POST sur l'API et redirection
        sendOrder(contact, products);

        //si les valeurs du formulaire ne sont pas valides
    } else {
        //message d'erreur
        alert("Veuillez remplir correctement chaque champs");
    };
});


//----fonction pour requeter l'api et rediriger sur la page de commande
function sendOrder(contact, products) {

    fetch("http://localhost:3000/api/products/order", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ contact: contact, products: products })
        })
        .then(function(res) {
            if (res.ok) {
                return res.json();
            }
        })
        .then(function(value) {
            linkOrder = "./confirmation.html?orderId=" + value.orderId;
            document.location.href = linkOrder;
        });

}