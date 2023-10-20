
//Função para traduzir algum texto
export function translateText(description) {
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
