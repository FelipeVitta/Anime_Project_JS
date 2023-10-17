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
        animeEpisodes.textContent = "Número de episodios: " + dado[0].episodes;
        animeEverageScore.textContent = "Avaliação: " + (dado[0].averageScore != null ? dado[0].averageScore : "?") + "/100";
        //Checando se a descrição é muito grande
        if(dado[0].description.length > 630){
          translateAndDivideText(dado[0].description)
        }else{
          translateText(dado[0].description).then(translatedText => {
            console.log("A descrição não era muito grande");
            animeDescription.innerHTML = translatedText;
          }).catch(error =>{
            animeDescription.innerHTML = dado[0].description;
            console.log(error);
          });
        }
        animeGenres.textContent = "Gêneros: " + dado[0].genres;
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

// Função responsável por concatenar e traduzir as descrições muito grandes
function translateAndDivideText(text) {
  let partsText = dividirStringEmPartes(text);
  const promisses = partsText.map(part => translateText(part));

  //se uma promisse for rejeitada a promisse.all será rejeitada
  Promise.all(promisses).then(translatedParts => {
    //junta um array de strings (translatedParts) e cada parte do array é separada por um espaço
    const concatenatedText = translatedParts.join(' ');
    console.log("A descrição era grande");
    animeDescription.innerHTML = concatenatedText;
  }).catch(error => {
    animeDescription.innerHTML = text;
    console.log(error);
  })
}

// Função para dividir a string em partes de 760
function dividirStringEmPartes(string) {
  let partes = [];
  for (var i = 0; i < string.length; i += 630) {
    partes.push(string.slice(i, i + 630));
  }
  return partes;
}

// Função para fazer requisição e traduzir um texto
function translateText(description) {
  return new Promise((resolve, reject) => {
    console.log(description.length)
    const data = JSON.stringify([
      {
        Text: description
      }
    ]);

    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener('readystatechange', function () {
      if (this.readyState === this.DONE) {
        if (this.status === 200) {
          const translatedText = JSON.parse(this.responseText)[0].translations[0].text;
          //operação assíncrona foi bem-sucedida e retornou um resultado
          resolve(translatedText);
        } else {
          reject(new Error('Erro na tradução'));
        }
      }
    });

    xhr.open('POST', 'https://microsoft-translator-text.p.rapidapi.com/translate?to%5B0%5D=pt&api-version=3.0&profanityAction=NoAction&textType=plain');
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.setRequestHeader('X-RapidAPI-Key', '815525dad7mshd81e2791f729929p1a435cjsn062e878947fd');
    xhr.setRequestHeader('X-RapidAPI-Host', 'microsoft-translator-text.p.rapidapi.com');

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