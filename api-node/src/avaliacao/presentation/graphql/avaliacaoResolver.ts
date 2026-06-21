import { diContainer } from '../../../shared/infrastructure/container.js'
import { createAvaliacaoQuery } from './avaliacaoQuery.js'
import { createAvaliacaoMutation } from './avaliacaoMutation.js'
import { Avaliacao } from '../../domain/Avaliacao.js'
import { redis } from '../../../shared/infrastructure/cache/redisClient.js'

const service = diContainer.getAvaliacaoService()
const usuarioService = diContainer.getUsuarioService()
const restauranteService = diContainer.getRestauranteService()

const queryBase = createAvaliacaoQuery(service)
const mutationBase = createAvaliacaoMutation(service)

export const avaliacaoResolver = {
  Query: {
    avaliacoes: async () => {
      const cacheKey = 'cache:avaliacoes:all';
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          // recupera do cache em caso de sucesso
          return JSON.parse(cached);
        }
      } catch (err) {
        console.error('[Cache] Erro ao ler avaliações do Redis:', err);
      }

      const res = await queryBase.avaliacoes();

      try {
        // salva no cache com TTL de 10 minutos (600 segundos)
        await redis.set(cacheKey, JSON.stringify(res), 'EX', 600);
      } catch (err) {
        console.error('[Cache] Erro ao salvar avaliações no Redis:', err);
      }

      return res;
    },

    avaliacao: async (_: any, { id }: { id: string }) => {
      const cacheKey = `cache:avaliacao:${id}`;
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          // recupera do cache em caso de sucesso
          return JSON.parse(cached);
        }
      } catch (err) {
        console.error(`[Cache] Erro ao ler avaliação ${id} do Redis:`, err);
      }

      const res = await queryBase.avaliacao(_, { id });

      try {
        // salva no cache com TTL de 10 minutos (600 segundos)
        await redis.set(cacheKey, JSON.stringify(res), 'EX', 600);
      } catch (err) {
        console.error(`[Cache] Erro ao salvar avaliação ${id} no Redis:`, err);
      }

      return res;
    }
  },

  Mutation: {
    criarAvaliacao: async (parent: any, args: any) => {
      const res = await mutationBase.criarAvaliacao(parent, args);
      // invalida chaves
      try {
        await redis.del('cache:avaliacoes:all');
      } catch (err) {
        console.error('[Cache] Erro ao invalidar lista de avaliações:', err);
      }
      return res;
    },

    editarAvaliacao: async (parent: any, args: any) => {
      const res = await mutationBase.editarAvaliacao(parent, args);
      // invalida chaves
      try {
        await Promise.all([
          redis.del('cache:avaliacoes:all'),
          redis.del(`cache:avaliacao:${args.id}`)
        ]);
      } catch (err) {
        console.error('[Cache] Erro ao invalidar chaves de avaliação:', err);
      }
      return res;
    },

    deletarAvaliacao: async (parent: any, args: any) => {
      const res = await mutationBase.deletarAvaliacao(parent, args);
      // invalida chaves
      try {
        await Promise.all([
          redis.del('cache:avaliacoes:all'),
          redis.del(`cache:avaliacao:${args.id}`)
        ]);
      } catch (err) {
        console.error('[Cache] Erro ao invalidar chaves de avaliação:', err);
      }
      return res;
    }
  },

  Avaliacao: {
    usuario: async (parent: Avaliacao) => {
      if (!parent.usuario_id) return null
      return usuarioService.buscarPorId(parent.usuario_id)
    },
    restaurante: async (parent: Avaliacao) => {
      if (!parent.restaurante_id) return null
      return restauranteService.buscarPorId(parent.restaurante_id)
    }
  }
}

