import type { ICategoriaService } from '../../application/ports/ICategoriaService.js'
import { catalogEventPublisher } from '../../../shared/infrastructure/messaging/catalogEventPublisher.js'

export const createCategoriaMutation = (service: ICategoriaService) => ({
  criarCategoria: async (_: any, args: { nome: string; restaurante_id: string }) => {
    const categoria = await service.criar(args)
    // Evento de catálogo: notifica o ms-recomendacao sobre a nova categoria
    catalogEventPublisher.categoriaCriada(categoria as any).catch(console.error)
    return categoria
  },

  editarCategoria: async (_: any, args: { id: string; nome?: string; restaurante_id?: string }) => {
    const { id, ...dados } = args
    const updateData = {
      ...dados,
      restaurante_id: dados.restaurante_id ? Number(dados.restaurante_id) : undefined
    }
    const antes = await service.buscarPorId(id)
    const categoria = await service.editarPorId(id, updateData)
    // Evento de catálogo: replica no ms-recomendacao a atualização
    catalogEventPublisher.categoriaAtualizada(antes as any, categoria as any).catch(console.error)
    return categoria
  },

  deletarCategoria: async (_: any, { id }: { id: string }) => {
    const antes = await service.buscarPorId(id)
    const result = !!(await service.deletar(id))
    // Evento de catálogo: replica no ms-recomendacao a remoção
    if (result && antes) {
      catalogEventPublisher.categoriaDeletada(antes as any).catch(console.error)
    }
    return result
  }
})
