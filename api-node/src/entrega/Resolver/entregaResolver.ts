import { createEntregaQuery } from './entregaQuery.js'
import { createEntregaMutation } from './entregaMutation.js'

import { EntregaRepository } from '../infrastructure/entregaRepository.js'
import { EntregaAppService } from '../application/entregaService.js'
import { RotaEntregaService } from '../application/rotaEntregaService.js'
import { AtribuicaoEntregaService } from '../application/atribuicaoEntregaService.js'
import { SimuladorDeslocamentoService } from '../application/simuladorDeslocamentoService.js'

import { PedidoAppService } from '../../pedido/application/pedidoService.js'
import { PedidoRepository } from '../../pedido/infrastructure/pedidoRepository.js'

import { UsuarioAppService } from '../../usuario/application/usuarioService.js'
import { UsuarioRepository } from '../../usuario/infrastructure/usuarioRepository.js'

import { EntregadorAppService } from '../../entregador/application/entregadorService.js'
import { EntregadorRepository } from '../../entregador/infrastructure/entregadorRepository.js'

import { RestauranteAppService } from '../../restaurante/application/restauranteService.js'
import { RestauranteRepository } from '../../restaurante/infrastructure/restauranteRepository.js'

import { RoteamentoAppService } from '../../roteamento/application/roteamentoService.js'
import { GrpcRoteamentoProvider } from '../../roteamento/infrastructure/grpcRoteamentoProvider.js'

// inicialização das dependências do módulo
const usuarioService = new UsuarioAppService(new UsuarioRepository())
const pedidoService = new PedidoAppService(new PedidoRepository(), usuarioService)

const restauranteService = new RestauranteAppService(new RestauranteRepository())
const roteamentoService = new RoteamentoAppService(new GrpcRoteamentoProvider())

const entregadorService = new EntregadorAppService(
  new EntregadorRepository(),
  restauranteService,
  new GrpcRoteamentoProvider()
)

const service = new EntregaAppService(
  new EntregaRepository()
)

const rotaService = new RotaEntregaService(
  service,
  pedidoService,
  entregadorService,
  restauranteService,
  roteamentoService
)

const atribuicaoService = new AtribuicaoEntregaService(
  service,
  pedidoService,
  restauranteService,
  entregadorService,
  roteamentoService
)

const simuladorService = new SimuladorDeslocamentoService(
  service,
  pedidoService,
  entregadorService,
  restauranteService,
  rotaService
)

export const entregaResolver = {
  Query: createEntregaQuery(service),
  Mutation: createEntregaMutation(service, simuladorService, atribuicaoService),
  Entrega: {
    pedido: async (parent: any) => {
      if (!parent.pedido_id) return null
      return pedidoService.buscarPorId(parent.pedido_id)
    },
    entregador: async (parent: any) => {
      if (!parent.entregador_id) return null
      return entregadorService.buscarPorId(parent.entregador_id)
    },
    rota: async (parent: any) => {
      if (!parent.id) return null
      return rotaService.obterRotaEstavel(parent.id)
    },
    rota_coleta: async (parent: any) => {
      if (!parent.id) return null
      return rotaService.obterRotaColeta(parent.id)
    },
    rota_entrega: async (parent: any) => {
      if (!parent.id) return null
      return rotaService.obterRotaEntrega(parent.id)
    }
  },
  Pedido: {
    entregas: async (parent: any) => {
      if (!parent.id) return []
      return service.buscarPorPedidoId(parent.id)
    }
  },
  Entregador: {
    entregas: async (parent: any) => {
      if (!parent.id) return []
      return service.buscarPorEntregadorId(parent.id)
    }
  }
}
