const express = require('express');
const proxy = require('express-http-proxy');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 8000;
const API_URL = process.env.API_URL;
const JWT_SECRET = process.env.JWT_SECRET;

if (!API_URL) {
  console.error('[Gateway] ERRO: variável de ambiente API_URL não definida!');
  process.exit(1);
}
if (!JWT_SECRET) {
  console.error('[Gateway] ERRO: variável de ambiente JWT_SECRET não definida!');
  process.exit(1);
}

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Auth-Token');
  res.setHeader('Access-Control-Expose-Headers', 'Authorization, X-Auth-Token');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// ─── Rate Limiting ───────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/graphql', limiter);

// ─── JWT Auth (valida token se presente, passa adiante mesmo sem ele) ────────
app.use('/graphql', (req, res, next) => {
  const auth = req.headers['authorization'] || '';
  const token = auth.replace('Bearer ', '');
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.headers['x-user'] = JSON.stringify(decoded);
    } catch (err) {
      // Token inválido — GraphQL decidirá o que fazer com o usuário anônimo
      console.warn('[Gateway] Token JWT inválido:', err.message);
    }
  }
  next();
});

// ─── Proxy → API Node ────────────────────────────────────────────────────────
app.use('/graphql', proxy(API_URL, {
  proxyReqPathResolver: () => '/graphql',
  proxyErrorHandler: (err, res) => {
    console.error('[Gateway] Erro ao conectar à API upstream:', err.message);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(502).json({
      errors: [{ message: `Gateway: falha ao conectar à API. (${err.message})` }]
    });
  }
}));

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/health', (_, res) => {
  res.json({ status: 'ok', upstream: API_URL, port: PORT });
});

app.get('/', (_, res) => {
  res.json({ service: 'Express Delivery API Gateway', status: 'running' });
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Gateway] Rodando na porta ${PORT}`);
  console.log(`[Gateway] Encaminhando /graphql → ${API_URL}/graphql`);
});
