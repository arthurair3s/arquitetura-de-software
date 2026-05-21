import * as restauranteService from '../restauranteService.js'
import { GraphQLError } from 'graphql'
import { criarRestauranteSchema, editarRestauranteSchema } from '../restauranteValidation.js'

export const Mutation = {
  criarRestaurante: async (_: any, args: { nome: string; descricao?: string; endereco?: string; latitude?: number; longitude?: number }) => {
    const parsed = criarRestauranteSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    return restauranteService.criar(parsed.data as any)
  },

  editarRestaurante: async (_: any, args: { id: string; nome?: string; descricao?: string; endereco?: string }) => {
    const parsed = editarRestauranteSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    const { id, ...dados } = parsed.data as any
    return restauranteService.editarPorId(id, dados)
  },

  deletarRestaurante: async (_: any, { id }: { id: string }) => !!(await restauranteService.deletar(id))
}
