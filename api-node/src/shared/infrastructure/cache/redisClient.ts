import { Redis } from 'ioredis';

// classe para gerenciar a conexão com o redis de forma resiliente
export class RedisClient {
  private static instance: Redis | null = null;

  public static getInstance(): Redis {
    if (!this.instance) {
      const redisUrl = process.env.REDIS_URL;
      const host = process.env.REDIS_HOST || 'localhost';
      const port = parseInt(process.env.REDIS_PORT || '6379', 10);
      const password = process.env.REDIS_PASSWORD;

      if (redisUrl) {
        console.log('[Redis] Conectando via REDIS_URL...');
        this.instance = new Redis(redisUrl, {
          retryStrategy(times: number) {
            return Math.min(times * 100, 3000);
          },
        });
      } else {
        console.log(`[Redis] Conectando a ${host}:${port}...`);
        this.instance = new Redis({
          host,
          port,
          password,
          retryStrategy(times: number) {
            return Math.min(times * 100, 3000);
          },
        });
      }

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
