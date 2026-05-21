import { z } from 'zod'

export const criarPagamentoSchema = z.object({
  pedido_id: z.string().or(z.number()),
  metodo: z.string().min(2, "Método de pagamento é obrigatório."),
  status: z.string().optional(),
  valor: z.coerce.number().min(0, "O valor não pode ser negativo.")
})

export const editarPagamentoSchema = z.object({
  id: z.string().or(z.number()),
  metodo: z.string().optional(),
  status: z.string().optional(),
  valor: z.coerce.number().min(0).optional()
})
