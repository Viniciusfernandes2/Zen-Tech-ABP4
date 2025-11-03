import { Router } from "express";
import { enviarParaESP } from '../../controllers/esp32Controller';
import { 
  getHistorico, 
  getUltimaQueda 
} from '../../controllers/quedaController';

const router = Router();

router.post("/queda", (req, res) => {
  console.log("📡 Dados recebidos:", req.body);
  res.json({ status: "ok", recebido: req.body });

  
});

// Rotas para o aplicativo React Native
router.get("/queda/historico", getHistorico);
router.get("/queda/ultima", getUltimaQueda);


// Bruno Menezes 01.11.2025: Rota para enviar dados para ESP32
router.post('/enviar', enviarParaESP);
  

export default router;