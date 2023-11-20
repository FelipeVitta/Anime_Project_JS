require('dotenv').config();
const apiKey = process.env.API_KEY;

//Função para traduzir algum texto
export function translateText(description) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    //verificando se a requisição foi concluida
    xhr.addEventListener('readystatechange', function () {
      if (this.readyState === this.DONE) {
        if (this.status === 200) {
          resolve(JSON.parse(this.responseText).translated_text.pt);
        } else {
          reject(new Error('A solicitação falhou com um status ' + this.status));
        }
      }
    });

    xhr.open('GET', `https://nlp-translation.p.rapidapi.com/v1/translate?text=${encodeURIComponent(description)}&to=pt&from=en`);
    xhr.setRequestHeader('X-RapidAPI-Key', apiKey);
    xhr.setRequestHeader('X-RapidAPI-Host', 'nlp-translation.p.rapidapi.com');

    xhr.send();
  });
}

export function makeGraphQLRequest(query, variables) {
  let url = 'https://graphql.anilist.co';
  let options = {
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

  return new Promise((resolve, reject) => {
    fetch(url, options)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Erro na solicitação: ' + response.status);
        }
      })
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function redirectToCardPage(htmlFile, cardId){
  let cardPageUrl = `${htmlFile}?id=${cardId}`;
  //redirecionando o navegador para a URL
  window.location.href = cardPageUrl;
}

