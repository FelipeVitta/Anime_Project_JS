const btnBack = document.getElementById('backButton');
const mainDiv = document.getElementById('main-div');
const animeBanner = document.getElementById('card-anime-image');
const animeTitle = document.getElementById('anime-title');
const animeEpisodes = document.getElementById('anime-n-episodes');
const animeEverageScore = document.getElementById('anime-everage-score');
const animeDescription = document.getElementById('anime-description');
const animeGenres = document.getElementById("anime-genres");

//Evento para voltar para catalogo no botão de voltar 
btnBack.addEventListener('click', () => {
    window.location.href = "catalogo.html";
})

//quando a página carregar
window.addEventListener('load', () => {
    //window.location.search é uma parte do objeto window.location que contém a parte de consulta (query string) da URL atual da página da web
    const urlParams = new URLSearchParams(window.location.search);
    const cardId = urlParams.get('id');
    if (cardId != null) {
        showCardDetails(cardId);
    } else {
        //Quando a página não tiver um parâmetro id, é carregada a página do anime com id 1
        showCardDetails(1);
    }
})

function showCardDetails(cardId) {
    let query = `
    query ($page: Int, $perPage: Int) {
        Page (page: $page, perPage: $perPage) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
            perPage
          }
          media (type: ANIME, sort: POPULARITY_DESC, id: ${cardId}) {
            id
            title {
              romaji
              english
            }
            genres
            episodes
            bannerImage
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
    };

    makeGraphQLRequest(query, variables)
        .then(function (response) {
            let tela = ``;
            let dado = response.data.Page.media;
            console.log("TAMANHO DO DADO " + dado.length);
            if (dado.length === 1) {
                animeBanner.src = dado[0].bannerImage;
                animeTitle.textContent = dado[0].title.english != null ? dado[0].title.english : dado[0].title.romaji
                animeEpisodes.textContent = "Número de episodios: " + dado[0].episodes;
                animeEverageScore.textContent = "Avaliação: " + (dado[0].averageScore != null ? dado[0].averageScore : "?") + "/100";
                animeDescription.textContent = dado[0].description;
                animeGenres.textContent = "Gêneros: " + dado[0].genres;
            } else {
                console.log("vai tomar no cu chegou porra nenhuma nesse cu");
            }
            console.log(response);
        })

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
        //response.json -> analisar o corpo da resposta, que geralmente contem um JSON
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