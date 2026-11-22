/**
 * MEU LIVRO EM INSTANTE — SERVIDOR BFF SEGURO
 * Servidor leve Node.js para isolamento de chaves de API e streaming de IA
 */

import http from 'http';
import { AIService, AIRequestBody } from './routes/ai';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

const server = http.createServer(async (req, res) => {
  // Configuração universal de cabeçalhos CORS para o front-end local
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Rota de verificação de integridade (Health Check)
  if (req.url === '/api/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'MeuLivro-BFF-Server', timestamp: new Date() }));
    return;
  }

  // Rota de assistência de IA com streaming (SSE)
  if (req.url === '/api/ai/editorial-assist' && req.method === 'POST') {
    let bodyData = '';
    req.on('data', chunk => { bodyData += chunk; });
    req.on('end', async () => {
      try {
        const parsedBody: AIRequestBody = JSON.parse(bodyData);

        // Configura resposta como Server-Sent Events (SSE)
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        });

        await AIService.handleStreamRequest(parsedBody, (chunk) => {
          res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
        });

        res.write('data: [DONE]\n\n');
        res.end();
      } catch (err: any) {
        console.error('Erro no processamento da IA:', err);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message || 'Erro interno no servidor de IA' }));
        } else {
          res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
          res.end();
        }
      }
    });
    return;
  }

  // Rota não encontrada
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint não encontrado' }));
});

server.listen(PORT, () => {
  console.log(`[BFF Seguro] Servidor operacional em http://localhost:${PORT}`);
  console.log(`[BFF Seguro] Blindagem de IA ativa. Chaves de API protegidas.`);
});

