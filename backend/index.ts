import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import router from './src/routes';
import os from 'os';

const app = express();

app.use(cors());
app.use(express.json());

// Bruno Menezes 01.11.2025: Resgata o IP local da máquina para mandar para ESP32, de forma dinamica
function getLocalIp(): string {
  const interfaces = os.networkInterfaces();

  for (const iface of Object.values(interfaces)) {
    for (const info of iface || []) {
      if (info.family === 'IPv4' && !info.internal) {
        return info.address;
      }
    }
  }
  return 'IP não encontrado';
}

// 🧠 Armazena o IP local em uma variável
const localIp = getLocalIp();

app.use((req, res, next) => {
  console.log(`Requisição recebida de ${req.method} ${req.url} | Servidor rodando em IP local: ${localIp}`);
  next();
});

// todas as rotas vão estar sob o prefixo /api
app.use('/api', router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://${localIp}:${PORT}`);
});
