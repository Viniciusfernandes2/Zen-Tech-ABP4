import express from 'express';
import cors from 'cors';
// import Routes from './src/routes/index.js';
const app = express();

app.use(cors());

app.use(express.json());

// app.use('/', Routes);
app.use('/teste', (req, res) => {
    res.send('API is running...');
});

// connect()

app.listen(3000, () => {
    console.log(`Servidor rodando na porta http://localhost:3000`);
});