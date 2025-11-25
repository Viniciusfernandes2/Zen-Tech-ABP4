import crypto from 'crypto';
import bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 10;

/**
 * Gera um token aleatório (hex) para o device.
 * Usado como token secreto do dispositivo (Bearer).
 */
export function gerarDeviceToken(lengthBytes = 48): string {
  return crypto.randomBytes(lengthBytes).toString('hex'); // 96 chars hex (seguro)
}

/**
 * Gera hash do token (bcrypt) para armazenar no banco.
 */
export async function hashDeviceToken(token: string): Promise<string> {
  return await bcrypt.hash(token, BCRYPT_ROUNDS);
}

/**
 * Compara token com hash (bcrypt.compare).
 */
export async function compareDeviceToken(token: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(token, hash);
}

/**
 * Gera código curto para pareamento (6 caracteres)
 * Letras e números, evitando confusão (sem O, I, 0, 1).
 * Exemplo: A93KF1
 */
export function gerarCodigoCurto(length = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; 
  let result = "";

  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * chars.length);
    result += chars[idx];
  }

  return result;
}

