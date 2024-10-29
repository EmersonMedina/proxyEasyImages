const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL // URL de tu frontend
}));

app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey === process.env.API_KEY) {
    res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  } else {
    res.status(403).json({ error: 'Unauthorized' });
  }
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 solicitudes
});

app.use(limiter);

app.get('/proxy', async (req, res) => {
  const imageUrl = req.query.url;
  try {
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    res.set('Content-Type', 'image/jpeg'); // Cambia si es necesario
    res.send(Buffer.from(buffer));
  } catch (error) {
    res.status(500).send('Error fetching image');
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
