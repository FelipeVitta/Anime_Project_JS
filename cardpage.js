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
  //voltando a página anterior no mesmo estado
  window.history.back();
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
          }
        }
      }
       
    `;

  let variables = {
    page: 1,
    perPage: 1,
  };

  makeGraphQLRequest(query, variables)
    .then(async function (response) {
      let tela = ``;
      let dado = response.data.Page.media;
      console.log("TAMANHO DO DADO " + dado.length);
      if (dado.length === 1) {
        animeBanner.src = dado[0].bannerImage;
        animeTitle.textContent = dado[0].title.english != null ? dado[0].title.english : dado[0].title.romaji
        animeEpisodes.innerHTML = "<b> Número de episodios: </b>" + dado[0].episodes;
        animeEverageScore.innerHTML = "<b> Avaliação: </b>" + (dado[0].averageScore != null ? dado[0].averageScore : "?") + "/100";
        translateText(dado[0].description).then(translatedText => {
          animeDescription.innerHTML = translatedText;
        }).catch(error => {
          console.error(error);
          animeDescription.innerHTML = dado[0].description;
        });
        animeGenres.innerHTML = "<b> Gêneros: </b>" + dado[0].genres;
      } else {
        //Tratamento quando a requisição não gerou erro mas nada foi encontrado
        console.log("chegou porra nenhuma nesse cu");
        mainDiv.innerHTML = "";
        const childElement = document.createElement('p');
        childElement.style.fontSize = "40px";
        childElement.style.textAlign = "center";
        childElement.textContent = 'Nenhum anime foi encontrado :(';
        mainDiv.appendChild(childElement);
      }
      console.log(response);
    })

}


// Função para fazer requisição e traduzir um texto
function translateText(description) {
  return new Promise((resolve, reject) => {
    const data = null;
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    //verificando se a requisição foi concluida
    xhr.addEventListener('readystatechange', function () {
      if (this.readyState === this.DONE) {
        if (this.status === 200) {
          console.log(JSON.parse(this.responseText).translated_text.pt);
          resolve(JSON.parse(this.responseText).translated_text.pt);
        } else {
          reject(new Error('A solicitação falhou com um status ' + this.status));
        }
      }
    });

    xhr.open('GET', `https://nlp-translation.p.rapidapi.com/v1/translate?text=${encodeURIComponent(description)}&to=pt&from=en`);
    xhr.setRequestHeader('X-RapidAPI-Key', '815525dad7mshd81e2791f729929p1a435cjsn062e878947fd');
    xhr.setRequestHeader('X-RapidAPI-Host', 'nlp-translation.p.rapidapi.com');

    xhr.send(data);
  });
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
    //response.json -> lê o corpo da resposta e a analisa, transformando os dados JSON em um objeto JavaScript que pode ser usado em seu código.
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
    //Tratamento quando a requisição deu erro
    mainDiv.innerHTML = "";
    const childElement = document.createElement('p');
    childElement.style.fontSize = "40px";
    childElement.textContent = 'Erro na solicitação :(';
    childElement.style.textAlign = "center";
    mainDiv.appendChild(childElement);
    console.error('Erro na solicitação:', error);
  }
}