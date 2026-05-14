import { z } from 'zod'

export const criarRestauranteSchema = z.object({
  nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres."),
  descricao: z.string().optional().nullable(),
  endereco: z.string().optional().nullable(),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable()
})

export const editarRestauranteSchema = z.object({
  id: z.string().or(z.number()),
  nome: z.string().optional(),
  descricao: z.string().optional().nullable(),
  endereco: z.string().optional().nullable()
})
