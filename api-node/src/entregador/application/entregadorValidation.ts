import { z } from 'zod'

export const criarEntregadorSchema = z.object({
  nome: z.string().min(2, "O nome deve ter no mínimo 2 caracteres."),
  telefone: z.string().optional().nullable(),
  veiculo: z.string().optional().nullable()
})

export const editarEntregadorSchema = z.object({
  id: z.string().or(z.number()),
  nome: z.string().min(2, "O nome deve ter no mínimo 2 caracteres.").optional(),
  telefone: z.string().optional().nullable(),
  veiculo: z.string().optional().nullable()
})
