import express from 'express';
import dotenv from 'dotenv';
import cors from "cors"

dotenv.config();
const app = express();
app.use(cors())
const PORT = 3000;
const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

app.get('/filme/:nome', async (req, res) => {
  const nome = req.params.nome;

  try {
    const searchResponse = await fetch(`${BASE_URL}/search/movie?query=${encodeURIComponent(nome)}&api_key=${API_KEY}&language=pt-BR`);
    const searchData = await searchResponse.json();

    const filme = searchData.results[0];
    if (!filme) return res.status(404).json({ error: 'Filme não encontrado' });

    const watchResponse = await fetch(`${BASE_URL}/movie/${filme.id}/watch/providers?api_key=${API_KEY}`);
    const watchData = await watchResponse.json();

    res.json({
      titulo: filme.title,
      sinopse: filme.overview,
      nota: filme.vote_average,
      lancamento: filme.release_date,
      poster: filme.poster_path ? `${IMAGE_BASE_URL}${filme.poster_path}` : null,
      onde_assistir: watchData.results.BR || {},
    });
  } catch (err) {
    console.error('Erro:', err.message);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.get('/ping', (req, res) => {
  res.send('pong');
});

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);

  const selfPingUrl = `https://flixfinder-pdhb.onrender.com/ping`;

  setInterval(async () => {
    try {
      const res = await fetch(selfPingUrl);
      const text = await res.text();
      console.log(`[Auto-ping]: ${text}`);
    } catch (err) {
      console.error('[Auto-ping erro]:', err.message);
    }
  }, 240000);
})
