import { Redis } from 'ioredis';

// classe para gerenciar a conexão com o redis de forma resiliente
export class RedisClient {
  private static instance: Redis | null = null;

  public static getInstance(): Redis {
    if (!this.instance) {
      const host = process.env.REDIS_HOST || 'localhost';
      const port = parseInt(process.env.REDIS_PORT || '6379', 10);

      this.instance = new Redis({
        host,
        port,
        retryStrategy(times: number) {
          // tenta reconectar após um delay progressivo
          const delay = Math.min(times * 100, 3000);
          return delay;
        },
      });

      this.instance.on('error', (err: unknown) => {
        console.error('[Redis] Erro de conexão:', err);
      });

      this.instance.on('connect', () => {
        console.log('[Redis] Conectado com sucesso.');
      });
    }

    return this.instance;
  }
}

export const redis = RedisClient.getInstance();
export default redis;
