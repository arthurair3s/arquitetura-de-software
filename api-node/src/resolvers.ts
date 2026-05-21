import { usuarioResolver } from './usuario/presentation/graphql/usuarioResolver.js'
import { restauranteResolver } from './restaurante/presentation/graphql/restauranteResolver.js'
import { produtoResolver } from './produto/presentation/graphql/produtoResolver.js'
import { pedidoResolver } from './pedido/presentation/graphql/pedidoResolver.js'
import { itemPedidoResolver } from './itemPedido/presentation/graphql/itemPedidoResolver.js'
import { categoriaResolver } from './categoria/presentation/graphql/categoriaResolver.js'
import { entregadorResolver } from './entregador/presentation/graphql/entregadorResolver.js'
import { entregaResolver } from './entrega/presentation/graphql/entregaResolver.js'
import { pagamentoResolver } from './pagamento/presentation/graphql/pagamentoResolver.js'
import { avaliacaoResolver } from './avaliacao/presentation/graphql/avaliacaoResolver.js'
import { roteamentoResolver } from './roteamento/presentation/graphql/roteamentoResolver.js'

export const resolvers = [
  usuarioResolver,
  restauranteResolver,
  produtoResolver,
  pedidoResolver,
  itemPedidoResolver,
  categoriaResolver,
  entregadorResolver,
  entregaResolver,
  pagamentoResolver,
  avaliacaoResolver,
  roteamentoResolver
];
