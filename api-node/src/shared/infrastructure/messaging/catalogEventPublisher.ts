import rabbitMQPublisher from './rabbitmqPublisher.js';

// Helper function to serialize Restaurante to plain object
function toPlainRestaurante(r: any) {
  if (!r) return undefined;
  return {
    id: r.id,
    nome: r.nome,
    descricao: r.descricao,
    endereco: r.endereco,
    latitude: r.latitude,
    longitude: r.longitude
  };
}

// Helper function to serialize Categoria to plain object
function toPlainCategoria(c: any) {
  if (!c) return undefined;
  return {
    id: c.id,
    nome: c.nome,
    restaurante_id: c.restaurante_id
  };
}

// Helper function to serialize Produto to plain object
function toPlainProduto(p: any) {
  if (!p) return undefined;
  return {
    id: p.id,
    nome: p.nome,
    preco: p.preco,
    descricao: p.descricao,
    categoria_id: p.categoria_id
  };
}

/**
 * Publica eventos de catálogo (restaurantes, categorias, produtos) no exchange
 * 'delivery-events' do RabbitMQ. O ms-recomendacao os consome para manter suas
 * réplicas locais sincronizadas — substituindo o pipeline anterior de Debezium
 * + Kafka CDC.
 *
 * ATENÇÃO — isto NÃO é o padrão Outbox, apesar de já ter sido descrito assim.
 * A publicação acontece depois do commit, em uma operação separada: se o
 * processo cair entre o commit e o publish, o evento se perde e a réplica fica
 * defasada até a próxima escrita naquele registro. Um Outbox de verdade exigiria
 * gravar o evento na MESMA transação e ter um relay lendo essa tabela.
 */
export class CatalogEventPublisher {
  async restauranteCriado(after: any): Promise<void> {
    await rabbitMQPublisher.publish('restaurante.created', { op: 'c', after: toPlainRestaurante(after) });
  }

  async restauranteAtualizado(before: any, after: any): Promise<void> {
    await rabbitMQPublisher.publish('restaurante.updated', { 
      op: 'u', 
      before: toPlainRestaurante(before), 
      after: toPlainRestaurante(after) 
    });
  }

  async restauranteDeletado(before: any): Promise<void> {
    await rabbitMQPublisher.publish('restaurante.deleted', { op: 'd', before: toPlainRestaurante(before) });
  }

  async categoriaCriada(after: any): Promise<void> {
    await rabbitMQPublisher.publish('categoria.created', { op: 'c', after: toPlainCategoria(after) });
  }

  async categoriaAtualizada(before: any, after: any): Promise<void> {
    await rabbitMQPublisher.publish('categoria.updated', { 
      op: 'u', 
      before: toPlainCategoria(before), 
      after: toPlainCategoria(after) 
    });
  }

  async categoriaDeletada(before: any): Promise<void> {
    await rabbitMQPublisher.publish('categoria.deleted', { op: 'd', before: toPlainCategoria(before) });
  }

  async produtoCriado(after: any): Promise<void> {
    await rabbitMQPublisher.publish('produto.created', { op: 'c', after: toPlainProduto(after) });
  }

  async produtoAtualizado(before: any, after: any): Promise<void> {
    await rabbitMQPublisher.publish('produto.updated', { 
      op: 'u', 
      before: toPlainProduto(before), 
      after: toPlainProduto(after) 
    });
  }

  async produtoDeletado(before: any): Promise<void> {
    await rabbitMQPublisher.publish('produto.deleted', { op: 'd', before: toPlainProduto(before) });
  }
}

export const catalogEventPublisher = new CatalogEventPublisher();
