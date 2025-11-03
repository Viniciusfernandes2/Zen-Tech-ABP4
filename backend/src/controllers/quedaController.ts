// controllers/quedaController.ts
import { Request, Response } from 'express';

// Simulando um "banco de dados" em memória (em produção, use um banco real)
let historicoQuedas: any[] = [];
let ultimaQueda: any = null;

export const registrarQueda = async (req: Request, res: Response) => {
  try {
    const { queda, x, y, z, total } = req.body;
    
    if (queda) {
      const novaQueda = {
        id: Date.now().toString(),
        data: new Date().toLocaleDateString('pt-BR'),
        horario: new Date().toLocaleTimeString('pt-BR'),
        x,
        y,
        z,
        total,
        timestamp: new Date().toISOString()
      };

      historicoQuedas.unshift(novaQueda); // Adiciona no início
      ultimaQueda = novaQueda;

      // Manter apenas as últimas 100 quedas
      if (historicoQuedas.length > 100) {
        historicoQuedas = historicoQuedas.slice(0, 100);
      }

      console.log('📝 Queda registrada:', novaQueda);
    }

    res.json({ 
      status: "ok", 
      mensagem: "Dados recebidos com sucesso",
      quedaRegistrada: queda 
    });
  } catch (error: any) {
    console.error('❌ Erro ao registrar queda:', error);
    res.status(500).json({ 
      erro: "Falha ao registrar queda",
      detalhe: error.message 
    });
  }
};

export const getHistorico = async (req: Request, res: Response) => {
  try {
    res.json(historicoQuedas);
  } catch (error: any) {
    console.error('❌ Erro ao buscar histórico:', error);
    res.status(500).json({ 
      erro: "Falha ao buscar histórico",
      detalhe: error.message 
    });
  }
};

export const getUltimaQueda = async (req: Request, res: Response) => {
  try {
    if (!ultimaQueda) {
      return res.status(404).json({ 
        mensagem: "Nenhuma queda registrada" 
      });
    }
    res.json(ultimaQueda);
  } catch (error: any) {
    console.error('❌ Erro ao buscar última queda:', error);
    res.status(500).json({ 
      erro: "Falha ao buscar última queda",
      detalhe: error.message 
    });
  }
};