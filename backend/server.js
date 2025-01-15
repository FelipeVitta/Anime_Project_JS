import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = 3000;

// Habilitar CORS para todas as rotas
app.use(cors());

app.get('/anime-news', async (req, res) => {
    const targetUrl = 'https://www.animenewsnetwork.com/news/rss.xml';
    try {
        const response = await fetch(targetUrl);
        const data = await response.text();

        // Retornar o XML para o frontend
        res.set('Content-Type', 'application/xml');
        res.send(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Error fetching data from Anime News Network');
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server is running on http://localhost:${PORT}`);
});
