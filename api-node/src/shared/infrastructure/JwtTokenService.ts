import jwt from 'jsonwebtoken';
import { ITokenService } from '../domain/ITokenService.js';
import { logger } from '../utils/logger.js';

export class JwtTokenService implements ITokenService {
  private readonly secret: string;

  constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.error('FATAL: A variável de ambiente JWT_SECRET não foi configurada.', 'JwtTokenService');
      throw new Error('FATAL: JWT_SECRET não configurada.');
    }
    this.secret = secret;
  }

  gerarToken(payload: object, expiresIn: string | number): string {
    return jwt.sign(payload, this.secret, { expiresIn: expiresIn as any });
  }

  verificarToken(token: string): any | null {
    try {
      return jwt.verify(token, this.secret);
    } catch (err: any) {
      logger.warn(`Token inválido ou expirado detectado: ${err.message}`, 'JwtTokenService');
      return null;
    }
  }
}
