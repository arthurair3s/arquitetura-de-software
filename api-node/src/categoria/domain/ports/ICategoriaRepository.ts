import { Categoria } from '../Categoria.js';

/**
 * ICategoriaRepository
 * 
 * Define o contrato público que qualquer implementação de repositório
 * de Categoria deve cumprir. Permite que a camada de Application dependa
 * desta interface (Domain) e não da implementação concreta (Infrastructure).
 */
export interface ICategoriaRepository {
  listarCategorias(): Promise<Categoria[]>;
  buscarCategoriaPorId(id: number | string): Promise<Categoria | null>;
  buscarCategoriasPorRestaurante(restaurante_id: number | string): Promise<Categoria[]>;
  criarCategoria(categoria: Categoria): Promise<Categoria>;
  editarCategoriaPorId(id: number | string, categoria: Partial<Categoria>): Promise<Categoria>;
  deletarCategoria(id: number | string): Promise<boolean>;
}
