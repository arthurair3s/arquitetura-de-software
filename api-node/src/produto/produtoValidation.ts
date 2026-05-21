import { z } from 'zod'

export const criarProdutoSchema = z.object({
  restaurante_id: z.string().or(z.number()),
  nome: z.string().min(2, "O nome do produto é obrigatório."),
  descricao: z.string().optional().nullable(),
  preco: z.coerce.number().min(0, "O preço não pode ser negativo.")
})

export const editarProdutoSchema = z.object({
  id: z.string().or(z.number()),
  nome: z.string().optional(),
  descricao: z.string().optional().nullable(),
  preco: z.coerce.number().min(0, "O preço não pode ser negativo.").optional()
})
