import { z } from 'zod'

export const criarEntregaSchema = z.object({
  pedido_id: z.string().or(z.number()),
  entregador_id: z.string().or(z.number()).optional().nullable(),
  status: z.string().optional(),
  previsao_entrega: z.string().optional().nullable()
})

export const editarEntregaSchema = z.object({
  id: z.string().or(z.number()),
  pedido_id: z.string().or(z.number()).optional(),
  entregador_id: z.string().or(z.number()).optional().nullable(),
  status: z.string().optional(),
  previsao_entrega: z.string().optional().nullable()
})
