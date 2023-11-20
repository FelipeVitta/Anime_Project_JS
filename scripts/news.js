import { redirectToCardPage } from './utils.js';
require('dotenv').config();

const apiKey = process.env.API_KEY;
const imageNews = document.getElementById("thumb");
const summaryNews = document.getElementById("news-summary");
const newsCards = document.getElementById("news-cards");

window.addEventListener('load', showAnimeNews);

function addCardNewsEventListeners() {
    document.querySelectorAll('.anime-card-news').forEach(card => {
        // Evite adicionar múltiplos listeners ao mesmo elemento
        if (!card.classList.contains('event-attached')) {
            card.addEventListener('click', function () {
                const cardId = this.getAttribute('id');
                redirectToCardPage("newspage.html",cardId);
            });
            card.classList.add('event-attached'); // Marque o card para saber que o evento já foi anexado
        }
    });
}

async function fetchAnimeNews() {

    const url = 'https://anime-news-net.p.rapidapi.com/api/news';
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': apiKey,
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
        console.log(response);
        response.map(e => {
            tela += `<div class="anime-card-news" id="${e.details_api.id}">
                    <figure id="center-news-image">
                        <img src="${e.article.thumbnail}" alt="thumb">
                    </figure>
                     <div id="news-information">
                        <h1 id="news-title">${e.article.title}</h1>
                    </div>
                    </div>`
        })
        newsCards.innerHTML = tela;
        addCardNewsEventListeners();
    });

}

