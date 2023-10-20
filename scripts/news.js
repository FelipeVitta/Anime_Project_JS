
import { translateText } from './utils.js';

const imageNews = document.getElementById("thumb");
const summaryNews = document.getElementById("news-summary");
const newsCards = document.getElementById("news-cards");

window.addEventListener('load', showAnimeNews);

async function fetchAnimeNews() {

    const url = 'https://anime-news-net.p.rapidapi.com/api/news';
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': '815525dad7mshd81e2791f729929p1a435cjsn062e878947fd',
            'X-RapidAPI-Host': 'anime-news-net.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

function showAnimeNews() {
    console.log("entra aq?");
    newsCards.innerHTML = '';
    let tela = '';
    fetchAnimeNews().then(response => {
        response.map(e => {
            tela += `<figure id="center-news-image">
                        <img src="${e.article.thumbnail}" alt="thumb">
                    </figure>
                     <div id="news-information">
                        <h1 id="news-title">${e.article.title}</h1>
                    </div>`
        })
        newsCards.innerHTML = tela;

    })

}

