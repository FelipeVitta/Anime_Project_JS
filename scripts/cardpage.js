import { translateText } from './utils.js';
import { makeGraphQLRequest } from './utils.js';

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
  if (window.history.length > 1) {
    window.history.back(); //voltando a página anterior no mesmo estado
  } else {
    window.location.href = '../views/catalogo.html';
  }
});

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
    .then(response => {
      let dado = response.data.Page.media;
      console.log("Dado length: " + dado.length);
      if (dado.length === 1) {
        animeBanner.src = dado[0].bannerImage;
        animeTitle.textContent = dado[0].title.english != null ? dado[0].title.english : dado[0].title.romaji
        animeEpisodes.innerHTML = "<b> Número de episodios: </b>" + dado[0].episodes;
        animeEverageScore.innerHTML = "<b> Avaliação: </b>" + (dado[0].averageScore != null ? dado[0].averageScore : "?") + "/100";
        // Traduzindo a descrição
        Promise.all([
          translateText(dado[0].description),
          translateText(dado[0].genres)
      ]).then(([translatedDescription, translatedGenres]) => {
          animeDescription.innerHTML = translatedDescription;
          animeGenres.innerHTML = `<b>Gêneros:</b> ${translatedGenres}`;
      }).catch(error => {
          console.error(error);
          animeDescription.innerHTML = dado[0].description;
          animeGenres.innerHTML = `<b>Gêneros:</b> ${dado[0].genres}`;
      });
      
      } else {
        //Tratamento quando a requisição não gerou erro mas nada foi encontrado
        mainDiv.innerHTML = "";
        const childElement = document.createElement('p');
        childElement.style.fontSize = "40px";
        childElement.style.textAlign = "center";
        childElement.textContent = 'Nenhum anime foi encontrado :(';
        mainDiv.appendChild(childElement);
      }
      console.log(response);
    }).catch(error => {
      mainDiv.innerHTML = "";
      const childElement = document.createElement('p');
      childElement.style.fontSize = "40px";
      childElement.textContent = 'Erro na solicitação :(';
      childElement.style.textAlign = "center";
      mainDiv.appendChild(childElement);
      console.error('Erro na solicitação:', error);
    })

}
