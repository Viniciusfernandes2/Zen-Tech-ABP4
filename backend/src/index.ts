import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import router from './routes'; // importa o arquivo backend/routes/index.ts

const app = express();

app.use(cors());
app.use(express.json());

// todas as rotas vão estar sob o prefixo /api
app.use('/api', router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

