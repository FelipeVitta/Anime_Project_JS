import { makeGraphQLRequest } from './utils.js';
import { redirectToCardPage } from './utils.js';

const bodyCatalog = document.querySelector(".catalogo");
const loader = document.getElementById('loader');
const loaderScroll = document.querySelector(".s-loader");
const srcInput = document.getElementById("src-but");
const genreSelect = document.getElementById("genre");
const maxEpsSelect = document.getElementById("max-eps-input");
const btnSearch = document.getElementById("buttonSearch");

sessionStorage.setItem('actualPage', 1);
sessionStorage.setItem('doneRequests', 0);

window.addEventListener('load', searchAnime);

btnSearch.addEventListener('click', searchAnime);

window.addEventListener('keydown', function (event) {
    if (event.key == 'Enter') {
        searchAnime(event);
    }
});

// Adicionando eventos de click aos cards
function addCardEventListeners() {
    document.querySelectorAll('.card').forEach(card => {
        // Evite adicionar múltiplos listeners ao mesmo elemento
        if (!card.classList.contains('event-attached')) {
            card.addEventListener('click', function () {
                const cardId = this.getAttribute('id');
                redirectToCardPage("cardpage.html",cardId);
            });
            card.classList.add('event-attached'); // Marque o card para saber que o evento já foi anexado
        }
    });
}


function setActualQuery(query) {
    sessionStorage.setItem('actualQuery', query);
}

function setActualPage(page) {
    sessionStorage.setItem('actualPage', page);
}

function setActualVariables(variables) {
    sessionStorage.setItem('actualVariables', JSON.stringify(variables));
}

function setDoneRequests(done) {
    sessionStorage.setItem('doneRequests', done);
}

//Função para filtrar animes de acordo com a pesquisa
function searchAnime(event) {
    console.log("Event Type: " + event.type + " " + " " + " Event Key: " + event.key);
    if (event.type == "load" || event.key === "Enter" || event.type == "click") {
        bodyCatalog.innerHTML = '';
        loader.style.display = 'inline-block';
        btnSearch.disabled = true;
        //Se nada foi digitado, listar os animes novamente
        let query = `
            query ($page: Int, $perPage: Int, $search: String, $genre: String, $episodes_lesser: Int) {
                Page (page: $page, perPage: $perPage) {
                  media (type: ANIME, sort: POPULARITY_DESC, search: $search, genre: $genre, episodes_lesser: $episodes_lesser) {
                    id
                    title {
                      romaji
                      english
                    }
                    averageScore
                    coverImage {
                      large
                    }
                  }
                }
              }
        `;

        let variables = {
            page: 1,
            perPage: 50,
            search: srcInput.value.trim() !== '' ? srcInput.value : null,
            genre: genreSelect.value !== "none" ? genreSelect.value : null,
            episodes_lesser: isNaN(parseInt(maxEpsSelect.value.trim())) ? 10000 : parseInt(maxEpsSelect.value)
        };


        setActualQuery(query);
        setActualVariables(variables);
        setActualPage(1);
        setDoneRequests(0);
        makeGraphQLRequest(query, variables)
            .then(response => {
                let tela = ``
                if (response.data.Page.media.length === 0) {
                    bodyCatalog.innerHTML = `<h1>Desculpe, não foi encontrado nenhum anime :( </h1>`
                    loader.style.display = 'none';
                    setActualPage(1);
                    setActualQuery('');
                    setActualVariables('');
                    setDoneRequests(1);
                } else {
                    response.data.Page.media.map((dado) => {
                        tela = tela + `
                                <div id="${dado.id}" class="card">
                                    <div class="card-prev-info">
                                    <p><b>${dado.title.english != null ? dado.title.english : dado.title.romaji}</b></p>
                                    <p>Avaliação: ${dado.averageScore != null ? dado.averageScore : "?"}/100</p>
                                    </div>
                                    <img src=${dado.coverImage.large}></img>
                                    </div>
                                    `
                    })
                    bodyCatalog.insertAdjacentHTML('beforeend', tela);
                    addCardEventListeners();
                    console.log(response);
                    loader.style.display = 'none';
                }
            }).catch(error => {
                console.error("Erro ao procurar animes: " + error);
            })

    }

    setTimeout(() => {
        btnSearch.disabled = false;
    }, 2500);

    console.log("=============INFOS=============\n")
    if (sessionStorage.getItem('doneRequests') == 0) {
        let vars = JSON.parse(sessionStorage.getItem('actualVariables'));
        console.log("PÁGINA ATUAL: " + vars.page);
        console.log("POR PÁGINA: " + vars.perPage);
        console.log("MÁXIMO DE EPISÓDIOS: " + vars.episodes_lesser);
        console.log("GÊNERO: " + vars.genre);
    }else{
        console.log("ACABARAM OS ANIMES!!");
    }
    console.log("===============================\n")


}


//Função para incrementar a actualPage e atualizar a page na actualVariables na sessionStorage
function incrementsPage() {

    //Converte o actualPage em inteiro (garante que seja um inteiro)
    let actualPage = parseInt(sessionStorage.getItem('actualPage'));
    //Converte string JSON em um objeto javascript (garante que seja objeto)
    let variables = JSON.parse(sessionStorage.getItem('actualVariables'));

    // Incrementar a página atual
    actualPage++;
    variables.page = actualPage;
    // Atualizar os valores na sessionStorage
    // console.log(sessionStorage.getItem('actualVariables'));
    sessionStorage.setItem('actualPage', actualPage);
    sessionStorage.setItem('actualVariables', JSON.stringify(variables));
}

//Função para carregar novos cards na tela
function loadAdditionalCards() {
    let queryQ = sessionStorage.getItem('actualQuery');
    let variablesV = sessionStorage.getItem('actualVariables');
    if (!(loader.style.display == "inline-block")) {
        loaderScroll.style.display = "inline-block";
    }
    if (!(queryQ === '') && !(variablesV === '')) {
        incrementsPage();
        let query = sessionStorage.getItem('actualQuery');
        let variables = sessionStorage.getItem('actualVariables');
        makeGraphQLRequest(query, variables).then(response => {
            //checando se ainda tem alguma página de requisição
            if (response.data.Page.media.length > 0) {
                let newCards = '';
                response.data.Page.media.map((dado) => {
                    newCards = newCards + `
                        <div id="${dado.id}" class="card">
                        <div class="card-prev-info">
                        <p><b>${dado.title.english != null ? dado.title.english : dado.title.romaji}</b></p>
                        <p>Avaliação: ${dado.averageScore != null ? dado.averageScore : "?"}/100</p>
                        </div>
                        <img src=${dado.coverImage.large}></img>
                        </div>
                    `;
                });
                //adicionando mais HTML dentro do bodyCatalog após seu último filho
                bodyCatalog.insertAdjacentHTML('beforeend', newCards);
                addCardEventListeners();
                console.log(response);
                // console.log(response.data.Page.pageInfo.currentPage);
            } else {
                console.log("Done Requests Setado para 1")
                sessionStorage.setItem('doneRequests', 1);
            }
            loaderScroll.style.display = "none";
        }).catch(error => {
            console.error("Erro ao carregar cards: " + error);
        })
    }

}

// Variável para controlar o estado do debounce
var canLoadAdditionalCards = true;

//Chamado quando o usuário rola a tela inteira
window.addEventListener("scroll", function () {
    // Checando se o usuário scrollou a tela toda e pode carregar mais cartões
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight && canLoadAdditionalCards) {
        canLoadCards();
    }
})

function canLoadCards() {
    // Define canLoadAdditionalCards como false para evitar chamadas adicionais
    canLoadAdditionalCards = false;
    let doneRequests = sessionStorage.getItem('doneRequests');
    if (!(parseInt(doneRequests))) {
        loadAdditionalCards();
    }
    console.log("=============INFOS=============\n")
    if (sessionStorage.getItem('doneRequests') == 0) {
        let vars = JSON.parse(sessionStorage.getItem('actualVariables'));
        console.log("PÁGINA ATUAL: " + vars.page);
        console.log("POR PÁGINA: " + vars.perPage);
        console.log("MÁXIMO DE EPISÓDIOS: " + vars.episodes_lesser);
        console.log("GÊNERO: " + vars.genre);
    }else{
        console.log("ACABARAM OS ANIMES!!");
    }
    console.log("===============================\n")

    // Agende a redefinição de canLoadAdditionalCards para true após segundos
    setTimeout(function () {
        canLoadAdditionalCards = true;
    }, 2500); // 2,5 segundos em milissegundos

}









