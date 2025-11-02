import { Request, Response } from 'express';
import os from 'os';

import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

// Bruno Menezes 01.11.2025: Resgata o IP local da máquina para mandar para ESP32, de forma dinamica
// Função para obter o IP local e o prefixo da rede
function getLocalIp(): { ip: string; base: string } | null {
  const interfaces = os.networkInterfaces();

  for (const iface of Object.values(interfaces)) {
    for (const info of iface || []) {
      if (info.family === 'IPv4' && !info.internal) {
        const ip = info.address;
        const base = ip.split('.').slice(0, 3).join('.'); // os três primeiros octetos
        return { ip, base };
      }
    }
  }
  return null;
}

// Função para dar ping em um IP
async function ping(ip: string): Promise<boolean> {
  const isWin = process.platform === 'win32';
  const cmd = isWin
    ? `ping -n 1 -w 500 ${ip}`
    : `ping -c 1 -W 1 ${ip}`;

  try {
    await execAsync(cmd);
    return true; // IP respondeu
  } catch {
    return false; // IP não respondeu
  }
}

// Função para encontrar um IP livre na rede
async function findFreeIp(): Promise<string | null> {
  const local = getLocalIp();
  if (!local) throw new Error('IP local não encontrado');

  const { ip: myIp, base } = local;
  const gateway = `${base}.1`; // geralmente o gateway é .1

  for (let i = 2; i <= 254; i++) {
    const candidate = `${base}.${i}`;
    if (candidate === myIp || candidate === gateway) continue;

    const alive = await ping(candidate);
    if (!alive) {
      return candidate; // IP livre encontrado
    }
  }

  return null; // nenhum IP livre
}

// Exemplo de uso
(async () => {
  const freeIp = await findFreeIp();
  console.log('IP livre encontrado:', freeIp);
})();

// IP da ESP32 na sua rede local
const ESP32_URL = 'http://192.168.15.78'; // altere para o IP da sua ESP32

export const enviarParaESP = async (req: Request, res: Response) => {
  try {
    const dadosRecebidos = req.body;
    const ipServidor = getLocalIp();
    const ipLivre = await findFreeIp();

    if (ipLivre) {
      console.log('🌐 IP livre encontrado para o servidor:', ipLivre);
    } else {
      console.log('⚠️ Nenhum IP livre encontrado na rede.');
    }

    const wifiLocal = 'Vivian'; // Wifi da casa por exemplo
    const senhaLocal = 'ramos2021' // Senha do Wifi da casa por exemplo;

    console.log('📩 Dados recebidos do cliente:', dadosRecebidos);
    console.log('💻 IP do servidor que está enviando:', ipServidor);

    // Adiciona o IP local do servidor no corpo da mensagem (opcional)
    const dadosParaEnviar = {
      ...dadosRecebidos,
      servidor_ip: ipServidor,
      wifiLocal: wifiLocal,
      senhaLocal: senhaLocal,
      ipLivre: ipLivre
    };

    const response = await fetch(`${ESP32_URL}/dados`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosParaEnviar),
    });

    const respostaESP = await response.text();

    console.log('📤 Resposta da ESP32:', respostaESP);

    res.status(200).json({
      mensagem: 'Dados enviados para a ESP32 com sucesso!',
      respostaESP,
    });
  } catch (error: any) {
    console.error('❌ Erro ao enviar para a ESP32:', error.message);
    res.status(500).json({
      erro: 'Falha ao enviar para a ESP32',
      detalhe: error.message,
    });
  }
};
