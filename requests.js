const bodyCatalog = document.querySelector(".catalogo");
const loader = document.getElementById('loader');
const srcInput = document.getElementById("src-but");

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

//Função para listar os animes
function catalogList() {
    //Definindo a query
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
          media (type: ANIME, sort: POPULARITY_DESC) {
            id
            title {
              romaji
            }
            averageScore
            description
            coverImage{
                large
            }
          }
        }
      }

`;
    // Definindo o valor das variaveis que serão usadas da nossa query 
    let variables = {
        page: 1,
        perPage: 50,
    };

    makeGraphQLRequest(query, variables)
        .then(function (response) {
            let tela = ``;
            loader.style.display = 'inline-block';
            console.log(response.data.Page.pageInfo.total);
            response.data.Page.media.map((dado) => {
                tela = tela + `
            <div id="${dado.id}" class="card">
            <div class="card-prev-info">
            <p><b>${dado.title.romaji}</b></p>
            <p>Avaliação: ${dado.averageScore}/100</p>
            </div>
            <img src=${dado.coverImage.large}></img>
            </div>
            `;
            });
            bodyCatalog.innerHTML = tela;
            console.log(response);
            loader.style.display = 'none';
            document.body.style.background = "linear-gradient(to right top, #0a2674, #145046)";
            // console.log(response.data.Page.pageInfo.currentPage);
        })
        .catch(function (error) {
            console.error(error);
        });

}

//Função para filtrar animes de acordo com a pesquisa
function searchAnime(event) {
    if (event.key === "Enter") {
        let anime = srcInput.value;
        //Se nada foi digitado, listar os animes novamente
        if (anime.length === 0) {
            catalogList();
        } else {
            let query = `
        query ($page: Int, $perPage: Int, $search: String) {
            Page (page: $page, perPage: $perPage) {
              pageInfo {
                total
                currentPage
                lastPage
                hasNextPage
                perPage
              }
              media (type: ANIME, sort: POPULARITY_DESC, search: $search) {
                id
                title {
                  romaji
                }
                averageScore
                description
                coverImage{
                    large
                }
              }
            }
          }
        `;

            let variables = {
                page: 1,
                perPage: 50,
                search: anime
            };

            makeGraphQLRequest(query, variables)
                .then(function (response) {
                    bodyCatalog.innerHTML = '';
                    loader.style.display = 'inline-block';
                    let tela = ``
                    let tempo = 2000;
                    if (response.data.Page.media.length === 0) {
                        document.body.style.background = "#024c4e";
                        bodyCatalog.innerHTML = `<h1>Desculpe, não foi encontrado nenhum anime :( </h1>`
                        loader.style.display = 'none';
                    } else {
                        response.data.Page.media.map((dado) => {
                            tela = tela + `
                            <div id="${dado.id}" class="card">
                                <div class="card-prev-info">
                                <p><b>${dado.title.romaji}</b></p>
                                <p>Avaliação: ${dado.averageScore}/100</p>
                                </div>
                                <img src=${dado.coverImage.large}></img>
                                </div>
                                `
                        })
                        bodyCatalog.innerHTML = tela;
                        console.log(response);
                        loader.style.display = 'none';
                        document.body.style.background = "linear-gradient(to right top, #0a2674, #145046)";
                        
                    }
                })

        }
    }

}