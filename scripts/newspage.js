import { translateText } from "./utils.js";
require('dotenv').config();

const apiKey = process.env.API_KEY;
let newsTitle = document.getElementById("news-title");
let newsAuthor = document.getElementById("news-author");
let newsSummary = document.getElementById("news-summary");
let newsImage = document.getElementById("anime-news-image");
const btnBack = document.getElementById('backButton');

btnBack.addEventListener('click', () => {
    if (window.history.length > 1) {
        window.history.back(); //voltando a página anterior no mesmo estado
    } else {
        window.location.href = '../views/noticias.html';
    }
});


window.addEventListener('load', () => {
    //window.location.search é uma parte do objeto window.location que contém a parte de consulta (query string) da URL atual da página da web
    const urlParams = new URLSearchParams(window.location.search);
    const newsId = urlParams.get('id');
    if (newsId != null) {
        showNewsDetail(newsId);
    } else {
        window.location.href = "../views/noticias.html";
    }
})

async function showNewsDetail(newsId) {
    try {
        const response = await fetchAnimeNews(newsId);
        console.log(response);

        newsImage.src = response[0].img;

        const [translatedTitle, translatedBody] = await Promise.all([
            translateText(response[0].title).catch(error => {
                console.error("Erro ao traduzir título: " + error);
                return response[0].title;
            }),
            translateText(response[0].body).catch(error => {
                console.error("Erro ao traduzir descrição: " + error);
                return response[0].body;
            })
        ]);

        newsTitle.innerHTML = translatedTitle;
        newsSummary.textContent = translatedBody;
    } catch (error) {
        console.error(error);
    }
}


async function fetchAnimeNews(newsId) {
    const url = `https://anime-news-net.p.rapidapi.com/api/news/details/2023-03-17/mai-nishikata-game-between-the-suits-manga-resumes-after-2-years/${newsId}`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': apiKey,  // Mude para uma forma segura de armazenar
            'X-RapidAPI-Host': 'anime-news-net.p.rapidapi.com'
        }
    };

    const response = await fetch(url, options);
    if (response.ok) {
        return response.json();
    } else {
        window.location.href = "../views/noticias.html";
        throw new Error('Deu erro nesse cu ' + response.statusText);
    }
}

