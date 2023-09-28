
const bodyCatalog = document.querySelector(".catalogo");
const loader = document.getElementById('loader');
const loaderScroll = document.querySelector(".s-loader");
const srcInput = document.getElementById("src-but");
const genreSelect = document.getElementById("genre");
const maxEpsSelect = document.getElementById("max-eps-input");
var nCards = 0;

sessionStorage.setItem('actualPage', 1);
sessionStorage.setItem('doneRequests', 0);
sessionStorage.setItem('maxEpisodes', 10000);

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

function setMaxEpisodes(episodes) {
    sessionStorage.setItem('maxEpisodes', episodes);
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

//Função para atualizar o filtro de número máximo de episódios
function updateMaxEpisodes() {
    const maxEpsValue = maxEpsSelect.value.trim();
    //Checando se o nuúmero digitado pelo usuário é valido
    if (!isNaN(parseInt(maxEpsValue))) {
        setMaxEpisodes(Math.abs(parseInt(maxEpsValue)));
    } else {
        setMaxEpisodes(10000);
    }
}

//Função para filtrar animes de acordo com a pesquisa
function searchAnime(event) {
    if (!event || event.key === "Enter") {
        bodyCatalog.innerHTML = '';
        loader.style.display = 'inline-block';
        //Se nada foi digitado, listar os animes novamente
        updateMaxEpisodes();
        nCards = 0;
        console.log("GENERO " + genreSelect.value);
        let query = `
            query ($page: Int, $perPage: Int, $search: String, $genre: String) {
                Page (page: $page, perPage: $perPage) {
                  pageInfo {
                    total
                    currentPage
                    lastPage
                    hasNextPage
                    perPage
                  }
                  media (type: ANIME, sort: POPULARITY_DESC, search: $search, genre: $genre) {
                    id
                    title {
                      romaji
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
            genre: genreSelect.value !== "none" ? genreSelect.value : null
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
                    max = parseInt(sessionStorage.getItem('maxEpisodes'));
                    response.data.Page.media.map((dado) => {
                        if (dado.episodes <= max && (max === 10000 || dado.episodes !== null)) {
                            nCards++;
                            tela = tela + `
                                <div id="${dado.id}" class="card">
                                    <div class="card-prev-info">
                                    <p><b>${dado.title.romaji}</b></p>
                                    <p>Avaliação: ${dado.averageScore}/100</p>
                                    </div>
                                    <img src=${dado.coverImage.large}></img>
                                    </div>
                                    `
                        }
                    })
                    bodyCatalog.innerHTML = tela;
                    console.log(response);
                    loader.style.display = 'none';
                }
            })

        //Após cada busca, checando se o número de cards na tela é menor que trinta ou se não tem barra lateral
        let requestsDone = parseInt(sessionStorage.getItem('doneRequests'));
        setTimeout(function() {
            if (nCards < 30 && requestsDone == 0) {
                console.log("Não tem barra lateral");
                verifyNcardsAndScrollbar();
            }
        }, 1000); // 2000 milissegundos = 2 segundos
    }

}

 //Função para carregar mais cards continuamente caso a scrollbar não apareça ou os cards permaneçam menor que 30
function verifyNcardsAndScrollbar() {
    const elemento = document.documentElement;
    let requestsDone = parseInt(sessionStorage.getItem('doneRequests'));
    // Defina um intervalo para verificar a condição
    const intervalo = setInterval(function() {
        console.log(nCards);
        //Checando se tem scrollBar, se o número de cards é menor que 30 e se não tem mais páginas da request
        if ((!(elemento.scrollHeight > elemento.clientHeight) || nCards < 30) && requestsDone === 0) {
            console.log("Não tem barra lateral");
            loaderScroll.style.display = "inline-block";
            canLoadCards(false); // Chame a função depois da pausa
        }else{
            if(requestsDone === 1){
                console.log("ACABARAM OS ANIMES!");
            }
            //para de carregar mais cards
            clearInterval(intervalo); 
            loaderScroll.style.display = "none";
        }
    }, 1000); // Verificar a cada 1 segundo (1000 milissegundos)
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
function loadAdditionalCards(valorBooleano) {
    let queryQ = sessionStorage.getItem('actualQuery');
    let variablesV = sessionStorage.getItem('actualVariables');
    if(valorBooleano){
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
                max = parseInt(sessionStorage.getItem('maxEpisodes'));
                response.data.Page.media.map((dado) => {
                    if (dado.episodes <= max && (max === 10000 || dado.episodes !== null)) {
                        nCards++;
                        newCards = newCards + `
                        <div id="${dado.id}" class="card">
                        <div class="card-prev-info">
                        <p><b>${dado.title.romaji}</b></p>
                        <p>Avaliação: ${dado.averageScore}/100</p>
                        </div>
                        <img src=${dado.coverImage.large}></img>
                        </div>
                    `;
                    }
                });
                console.log("Cards Add " + nCards);
                bodyCatalog.innerHTML += newCards;
                console.log(response);
                // console.log(response.data.Page.pageInfo.currentPage);
            } else {
                console.log("Não há mais páginas!!")
                sessionStorage.setItem('doneRequests', 1);
            }
            if(valorBooleano){
                loaderScroll.style.display = "none";
            }
        })
    }

}

// Variável para controlar o estado do debounce
var canLoadAdditionalCards = true;

//Chamado quando o usuário rola a tela inteira
window.addEventListener("scroll", function () {
    // Checando se o usuário scrollou a tela toda e pode carregar mais cartões
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight && canLoadAdditionalCards) {
        canLoadCards(true);
    }
})

//valorBooleano -> Definir corretamente quando o loader de carregar mais cards deve aparecer 
function canLoadCards(valorBooleano) {
    // Define canLoadAdditionalCards como false para evitar chamadas adicionais
    canLoadAdditionalCards = false;
    let doneRequests = sessionStorage.getItem('doneRequests');
    console.log("Done requests: " + doneRequests);
    //Cechando se não há mais páginas para serem carregadas dessa requisição
    console.log("DONE REQUESTS " + doneRequests);
    if (!(parseInt(doneRequests))) {
        loadAdditionalCards(valorBooleano);
    }
    console.log("=============INFOS=============\n")
    console.log("QUERY: " + sessionStorage.getItem('actualQuery'));
    console.log("VARIAVEIS: " + sessionStorage.getItem('actualVariables'));
    console.log("PÁGINA ATUAL: " + sessionStorage.getItem('actualPage'));
    console.log("MAXIMO DE EPISODIOS " + parseInt(sessionStorage.getItem('maxEpisodes')))
    console.log('Você chegou ao final da página!');
    console.log("\n==============================");

    // Agende a redefinição de canLoadAdditionalCards para true após 1 segundo
    setTimeout(function () {
        canLoadAdditionalCards = true;
    }, 1000); // 1 segundo em milissegundos

}








