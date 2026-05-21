import { createEntregaQuery } from './entregaQuery.js'
import { createEntregaMutation } from './entregaMutation.js'

import { EntregaRepository } from '../../infrastructure/adapters/entregaRepository.js'
import { EntregaAppService } from '../../application/services/entregaService.js'
import { RotaEntregaService } from '../../application/services/rotaEntregaService.js'
import { AtribuicaoEntregaService } from '../../application/services/atribuicaoEntregaService.js'
import { SimuladorDeslocamentoService } from '../../application/services/simuladorDeslocamentoService.js'

import { PedidoAppService } from '../../../pedido/application/services/pedidoService.js'
import { PedidoRepository } from '../../../pedido/infrastructure/adapters/pedidoRepository.js'

import { UsuarioAppService } from '../../../usuario/application/services/usuarioService.js'
import { JwtTokenService } from '../../../shared/infrastructure/JwtTokenService.js'
import { UsuarioRepository } from '../../../usuario/infrastructure/adapters/usuarioRepository.js'

import { EntregadorAppService } from '../../../entregador/application/services/entregadorService.js'
import { EntregadorRepository } from '../../../entregador/infrastructure/adapters/entregadorRepository.js'

import { RestauranteAppService } from '../../../restaurante/application/services/restauranteService.js'
import { RestauranteRepository } from '../../../restaurante/infrastructure/adapters/restauranteRepository.js'

import { RoteamentoAppService } from '../../../roteamento/application/services/roteamentoService.js'
import { GrpcRoteamentoProvider } from '../../../roteamento/infrastructure/adapters/grpcRoteamentoProvider.js'

// inicialização das dependências do módulo
const usuarioService = new UsuarioAppService(new UsuarioRepository(), new JwtTokenService())
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
