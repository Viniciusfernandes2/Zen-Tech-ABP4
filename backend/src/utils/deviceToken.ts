import crypto from 'crypto';
import bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 10;

/**
 * Gera um token aleatório (hex) para o device.
 */
export function gerarDeviceToken(lengthBytes = 48): string {
  return crypto.randomBytes(lengthBytes).toString('hex'); // 96 chars hex (seguro)
}

/**
 * Gera hash do token (bcrypt).
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
