
//Lista os 50 animes mais populares
function catalogList(){
var query = `
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
var variables = {
    page: 1,
    perPage: 50
};

// Define the config we'll need for our Api request
var url = 'https://graphql.anilist.co',
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

// Make the HTTP Api request
fetch(url, options).then(handleResponse)
                   .then(handleData)
                   .catch(handleError);

function handleResponse(response) {
    return response.json().then(function (json) {
        return response.ok ? json : Promise.reject(json);
    });
}

//função para printar os dados na tela
function handleData(response) {
    let div = document.querySelector(".catalogo");
    let tela = ``
    response.data.Page.media.map((dado) =>{
        tela = tela + `
        <div class="card">
        <p>${dado.title.romaji}<p>
        <p>Avaliação: ${dado.averageScore}/100<p>
        <img src=${dado.coverImage.large}></img>
        </div>
        `
    })
    div.innerHTML = tela;
    console.log(response);
    document.getElementById('loader').style.display = 'none';
}

//função para printar o erro de requisição
function handleError(error) {
    alert('Error, check console');
    console.error(error);
}

    
}

