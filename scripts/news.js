import { redirectToCardPage } from './utils.js';
const apiKey = '815525dad7mshd81e2791f729929p1a435cjsn062e878947fd';
const newsCards = document.getElementById("news-cards");
const url = 'http://localhost:3000/anime-news';

window.addEventListener('load', showAnimeNews);

function addCardNewsEventListeners() {
    document.querySelectorAll('.anime-card-news').forEach(card => {
        if (!card.classList.contains('event-attached')) {
            card.addEventListener('click', function () {
                const link = this.getAttribute('data-link'); // Obtém o link armazenado no atributo data-link
                if (link) {
                    window.open(link, '_blank'); // Abre o link em uma nova aba
                } else {
                    console.error("Nenhum link encontrado para este card.");
                }
            });
            card.classList.add('event-attached');
        }
    });
}


async function fetchAnimeNews() {
    try {
        const response = await fetch(url);
        const textResponse = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(textResponse, "application/xml");
        return xmlDoc;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

function showAnimeNews() {
    newsCards.innerHTML = '';
    let tela = '';

    fetchAnimeNews().then(xmlDoc => {
        const items = xmlDoc.getElementsByTagName('item');
        Array.from(items).forEach(item => {
            const title = item.getElementsByTagName('title')[0]?.textContent;
            const link = item.getElementsByTagName('link')[0]?.textContent;
            const description = item.getElementsByTagName('description')[0]?.textContent;
            const pubDate = item.getElementsByTagName('pubDate')[0]?.textContent;

            tela += `<div class="anime-card-news" id="${link}" data-link="${link}">
                    <div id="news-information">
                        <h1 id="news-title">${title}</h1>
                        <p>${description}</p>
                        <p><small>${new Date(pubDate).toLocaleDateString()}</small></p>
                    </div>
                </div>`;
        });

        newsCards.innerHTML = tela;
        addCardNewsEventListeners();
    }).catch(error => {
        console.error("Failed to load news:", error);
    });
}
