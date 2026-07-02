import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email("E-mail em formato inválido."),
  senha: z.string().min(1, "A senha não pode ser vazia.")
})

export const criarUsuarioSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  email: z.string().email("E-mail em formato inválido."),
  telefone: z.string().optional().nullable(),
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
  role: z.string().optional(),
  entregador_id: z.coerce.number().optional().nullable(),
  restaurante_id: z.coerce.number().optional().nullable()
})

export const editarUsuarioSchema = z.object({
  id: z.string().or(z.number()),
  nome: z.string().optional(),
  email: z.string().email("E-mail em formato inválido.").optional(),
  telefone: z.string().optional().nullable(),
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres.").optional(),
  role: z.string().optional(),
  entregador_id: z.coerce.number().optional().nullable(),
  restaurante_id: z.coerce.number().optional().nullable()
})

export const atualizarEnderecoSchema = z.object({
  latitude: z.coerce.number().nullable().optional(),
  longitude: z.coerce.number().nullable().optional(),
  endereco: z.string().min(1, "O endereço não pode ser vazio.").optional().nullable()
}).refine(data => {
  return (data.latitude != null && data.longitude != null) || (data.endereco && data.endereco.trim() !== "")
}, {
  message: "Forneça coordenadas válidas ou um endereço em texto."
})
