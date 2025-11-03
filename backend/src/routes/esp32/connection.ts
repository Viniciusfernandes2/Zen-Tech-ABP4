// routes/connection.ts
import { Router } from "express";
import { enviarParaESP } from '../../controllers/esp32Controller';
import { 
  registrarQueda, 
  getHistorico, 
  getUltimaQueda 
} from '../../controllers/quedaController';

const router = Router();

// Rota para receber dados de queda do ESP32
router.post("/queda", registrarQueda);

// Rotas para o aplicativo React Native
router.get("/queda/historico", getHistorico);
router.get("/queda/ultima", getUltimaQueda);

// Bruno Menezes 01.11.2025: Rota para enviar dados para ESP32
router.post('/enviar', enviarParaESP);

export default router;