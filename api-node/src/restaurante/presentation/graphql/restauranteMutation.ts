import type { IRestauranteService } from '../../application/ports/IRestauranteService.js'
import { GraphQLError } from 'graphql'
import { criarRestauranteSchema, editarRestauranteSchema } from '../../application/restauranteValidation.js'
import { catalogEventPublisher } from '../../../shared/infrastructure/messaging/catalogEventPublisher.js'

export const createRestauranteMutation = (service: IRestauranteService) => ({
  criarRestaurante: async (_: any, args: {
    nome: string
    descricao?: string
    endereco?: string
    latitude?: number
    longitude?: number
  }) => {
    const parsed = criarRestauranteSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    const restaurante = await service.criar(parsed.data as any)
    // Outbox: notifica o ms-recomendacao sobre o novo restaurante
    catalogEventPublisher.restauranteCriado(restaurante as any).catch(console.error)
    return restaurante
  },

  editarRestaurante: async (_: any, args: {
    id: string
    nome?: string
    descricao?: string
    endereco?: string
    latitude?: number
    longitude?: number
  }) => {
    const parsed = editarRestauranteSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    const { id, ...dados } = parsed.data as any
    const antes = await service.buscarPorId(id)
    const restaurante = await service.editarPorId(id, dados)
    // Outbox: notifica o ms-recomendacao sobre a atualização
    catalogEventPublisher.restauranteAtualizado(antes as any, restaurante as any).catch(console.error)
    return restaurante
  },

  deletarRestaurante: async (_: any, { id }: { id: string }) => {
    const antes = await service.buscarPorId(id)
    const result = !!(await service.deletar(id))
    // Outbox: notifica o ms-recomendacao sobre a remoção
    if (result && antes) {
      catalogEventPublisher.restauranteDeletado(antes as any).catch(console.error)
    }
    return result
  }
})
