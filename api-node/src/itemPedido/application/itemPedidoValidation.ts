import { z } from 'zod'

export const criarItemPedidoSchema = z.object({
  pedido_id: z.string().or(z.number()),
  produto_id: z.string().or(z.number()),
  quantidade: z.coerce.number().min(1, "A quantidade deve ser pelo menos 1."),
  preco_unitario: z.coerce.number().min(0, "O preço não pode ser negativo.")
})

export const editarItemPedidoSchema = z.object({
  id: z.string().or(z.number()),
  quantidade: z.coerce.number().min(1, "A quantidade deve ser pelo menos 1.").optional(),
  preco_unitario: z.coerce.number().min(0, "O preço não pode ser negativo.").optional()
})
