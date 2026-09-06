import { z } from 'zod'

// usuario_id não é mais entrada do cliente: vem do token, validado pela @auth.
export const criarPedidoSchema = z.object({
  restaurante_id: z.string().or(z.number()),
  destino_latitude: z.coerce.number().nullable().optional(),
  destino_longitude: z.coerce.number().nullable().optional(),
  valor_total: z.coerce.number().min(0, "O valor total não pode ser negativo.")
})

export const editarPedidoSchema = z.object({
  id: z.string().or(z.number()),
  status: z.string().optional(),
  valor_total: z.coerce.number().min(0, "O valor total não pode ser negativo.").optional(),
  destino_latitude: z.coerce.number().nullable().optional(),
  destino_longitude: z.coerce.number().nullable().optional()
})
