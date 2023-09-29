
const bodyCatalog = document.querySelector(".catalogo");
const loader = document.getElementById('loader');
const loaderScroll = document.querySelector(".s-loader");
const srcInput = document.getElementById("src-but");
const genreSelect = document.getElementById("genre");
const maxEpsSelect = document.getElementById("max-eps-input");

sessionStorage.setItem('actualPage', 1);
sessionStorage.setItem('doneRequests', 0);

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

//função para fazer a request
function makeGraphQLRequest(query, variables) {
    let url = 'https://graphql.anilist.co',
        options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                variables: variables
            })
        };

    // Make the HTTP API request
    return fetch(url, options)
        .then(handleResponse)
        .catch(handleError);

    function handleResponse(response) {
        return response.json().then(function (json) {
            // response.ok = se a resposta está no intervalo de 200 - 299
            if (response.ok) {
                return json;
            } else {
                throw new Error('Erro na solicitação: ' + response.status);
            }
        });
    }

    function handleError(error) {
        console.error('Erro na solicitação:', error);
        throw error; // Lança o erro para que o chamador possa lidar com ele
    }
}


//Função para filtrar animes de acordo com a pesquisa
function searchAnime(event) {
    if (!event || event.key === "Enter") {
        bodyCatalog.innerHTML = '';
        loader.style.display = 'inline-block';
        //Se nada foi digitado, listar os animes novamente
        let query = `
            query ($page: Int, $perPage: Int, $search: String, $genre: String, $episodes_lesser: Int) {
                Page (page: $page, perPage: $perPage) {
                  pageInfo {
                    total
                    currentPage
                    lastPage
                    hasNextPage
                    perPage
                  }
                  media (type: ANIME, sort: POPULARITY_DESC, search: $search, genre: $genre, episodes_lesser: $episodes_lesser) {
                    id
                    title {
                      romaji
                      english
                    }
                    episodes
                    averageScore
                    description
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
            .then(function (response) {
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
                                    <p>Avaliação: ${dado.averageScore}/100</p>
                                    </div>
                                    <img src=${dado.coverImage.large}></img>
                                    </div>
                                    `                        
                    })
                    bodyCatalog.innerHTML = tela;
                    console.log(response);
                    loader.style.display = 'none';
                }
            })
        
    }

    console.log("=============INFOS=============\n")
    console.log("QUERY: " + sessionStorage.getItem('actualQuery'));
    console.log("VARIAVEIS: " + sessionStorage.getItem('actualVariables'));
    console.log("PÁGINA ATUAL: " + sessionStorage.getItem('actualPage'));

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
    if(!(loader.style.display == "inline-block")){
        loaderScroll.style.display = "inline-block";
    }
    if (!(queryQ === '') && !(variablesV === '')) {
        incrementsPage();
        let query = sessionStorage.getItem('actualQuery');
        let variables = sessionStorage.getItem('actualVariables');
        makeGraphQLRequest(query, variables).then(async function (response) {
            //checando se ainda tem alguma página de requisição
            console.log("TAMANHO DA PÁGINA DA REQUEST " + response.data.Page.media.length);
            if (response.data.Page.media.length > 0) {
                let newCards = '';
                response.data.Page.media.map((dado) => {
                        newCards = newCards + `
                        <div id="${dado.id}" class="card">
                        <div class="card-prev-info">
                        <p><b>${dado.title.english != null ? dado.title.english : dado.title.romaji}</b></p>
                        <p>Avaliação: ${dado.averageScore}/100</p>
                        </div>
                        <img src=${dado.coverImage.large}></img>
                        </div>
                    `;      
                });
                bodyCatalog.innerHTML += newCards;
                console.log(response);
                // console.log(response.data.Page.pageInfo.currentPage);
            } else {
                console.log("Done Requests Setado para 1")
                sessionStorage.setItem('doneRequests', 1);
            }
                loaderScroll.style.display = "none";
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
    console.log("QUERY: " + sessionStorage.getItem('actualQuery'));
    console.log("VARIAVEIS: " + sessionStorage.getItem('actualVariables'));
    console.log("PÁGINA ATUAL: " + sessionStorage.getItem('actualPage'));
    if((parseInt(doneRequests)) === 1){
        console.log("DONE REQUESTS " + doneRequests);
        console.log("ACABARAM OS ANIMES!!");
    }else{
        console.log("DONE REQUESTS " + doneRequests);
    }
    console.log('Você chegou ao final da página!');
    console.log("\n==============================");

    // Agende a redefinição de canLoadAdditionalCards para true após 1 segundo
    setTimeout(function () {
        canLoadAdditionalCards = true;
    }, 2000); // 2 segundos em milissegundos

}








