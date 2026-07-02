import { diContainer } from '../../../shared/infrastructure/container.js'
import { createRestauranteQuery } from './restauranteQuery.js'
import { createRestauranteMutation } from './restauranteMutation.js'
import { redis } from '../../../shared/infrastructure/cache/redisClient.js'

const service = diContainer.getRestauranteService()
const queryBase = createRestauranteQuery(service)
const mutationBase = createRestauranteMutation(service)

export const restauranteResolver = {
  Query: {
    restaurantes: async () => {
      const cacheKey = 'cache:restaurantes:all';
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          // recupera do cache em caso de sucesso
          return JSON.parse(cached);
        }
      } catch (err) {
        console.error('[Cache] Erro ao ler restaurantes do Redis:', err);
      }

      const res = await queryBase.restaurantes();
      const plainList = res.map((r) => ({
        id: r.id,
        nome: r.nome,
        descricao: r.descricao,
        endereco: r.endereco,
        latitude: r.latitude,
        longitude: r.longitude
      }));

      try {
        // salva no cache com TTL de 5 minutos (300 segundos)
        await redis.set(cacheKey, JSON.stringify(plainList), 'EX', 300);
      } catch (err) {
        console.error('[Cache] Erro ao salvar restaurantes no Redis:', err);
      }

      return plainList;
    },

    restaurante: async (_: any, { id }: { id: string }) => {
      const cacheKey = `cache:restaurante:${id}`;
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          // recupera do cache em caso de sucesso
          return JSON.parse(cached);
        }
      } catch (err) {
        console.error(`[Cache] Erro ao ler restaurante ${id} do Redis:`, err);
      }

      const res = await queryBase.restaurante(_, { id });
      if (!res) return null;

      const plain = {
        id: res.id,
        nome: res.nome,
        descricao: res.descricao,
        endereco: res.endereco,
        latitude: res.latitude,
        longitude: res.longitude
      };

      try {
        // salva no cache com TTL de 3 minutos (180 segundos)
        await redis.set(cacheKey, JSON.stringify(plain), 'EX', 180);
      } catch (err) {
        console.error(`[Cache] Erro ao salvar restaurante ${id} no Redis:`, err);
      }

      return plain;
    }
  },

  Mutation: {
    criarRestaurante: async (parent: any, args: any) => {
      const res = await mutationBase.criarRestaurante(parent, args);
      // invalida cache de listagem
      try {
        await redis.del('cache:restaurantes:all');
      } catch (err) {
        console.error('[Cache] Erro ao invalidar lista de restaurantes:', err);
      }
      return res;
    },

    editarRestaurante: async (parent: any, args: any) => {
      const res = await mutationBase.editarRestaurante(parent, args);
      // invalida chaves
      try {
        await Promise.all([
          redis.del('cache:restaurantes:all'),
          redis.del(`cache:restaurante:${args.id}`)
        ]);
      } catch (err) {
        console.error('[Cache] Erro ao invalidar chaves de restaurante:', err);
      }
      return res;
    },

    deletarRestaurante: async (parent: any, args: any) => {
      const res = await mutationBase.deletarRestaurante(parent, args);
      // invalida chaves
      try {
        await Promise.all([
          redis.del('cache:restaurantes:all'),
          redis.del(`cache:restaurante:${args.id}`)
        ]);
      } catch (err) {
        console.error('[Cache] Erro ao invalidar chaves de restaurante:', err);
      }
      return res;
    }
  }
}

