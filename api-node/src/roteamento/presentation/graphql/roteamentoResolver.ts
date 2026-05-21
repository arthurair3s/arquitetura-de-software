import { GrpcRoteamentoProvider } from '../../infrastructure/adapters/grpcRoteamentoProvider.js'
import { RoteamentoAppService } from '../../application/services/roteamentoService.js'
import { createRoteamentoQuery } from './roteamentoQuery.js'

// inicialização das dependências do módulo
const provider = new GrpcRoteamentoProvider()
const service = new RoteamentoAppService(provider)

export const roteamentoResolver = {
  Query: createRoteamentoQuery(service)
}
