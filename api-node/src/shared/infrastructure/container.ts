import { JwtTokenService } from './JwtTokenService.js';

// Usuario
import { UsuarioRepository } from '../../usuario/infrastructure/adapters/usuarioRepository.js';
import { UsuarioAppService } from '../../usuario/application/services/usuarioService.js';

// Restaurante
import { RestauranteRepository } from '../../restaurante/infrastructure/adapters/restauranteRepository.js';
import { RestauranteAppService } from '../../restaurante/application/services/restauranteService.js';

// Produto
import { ProdutoRepository } from '../../produto/infrastructure/adapters/produtoRepository.js';
import { ProdutoAppService } from '../../produto/application/services/produtoService.js';

// Categoria
import { CategoriaRepository } from '../../categoria/infrastructure/adapters/categoriaRepository.js';
import { CategoriaAppService } from '../../categoria/application/services/categoriaService.js';

// Pedido
import { PedidoRepository } from '../../pedido/infrastructure/adapters/pedidoRepository.js';
import { PedidoAppService } from '../../pedido/application/services/pedidoService.js';

// ItemPedido
import { ItemPedidoRepository } from '../../itemPedido/infrastructure/adapters/itemPedidoRepository.js';
import { ItemPedidoAppService } from '../../itemPedido/application/services/itemPedidoService.js';

// Roteamento
import { GrpcRoteamentoProvider } from '../../roteamento/infrastructure/adapters/grpcRoteamentoProvider.js';
import { RoteamentoAppService } from '../../roteamento/application/services/roteamentoService.js';

// Entregador
import { EntregadorRepository } from '../../entregador/infrastructure/adapters/entregadorRepository.js';
import { EntregadorAppService } from '../../entregador/application/services/entregadorService.js';

// Entrega
import { EntregaRepository } from '../../entrega/infrastructure/adapters/entregaRepository.js';
import { EntregaAppService } from '../../entrega/application/services/entregaService.js';

// Pagamento
import { PagamentoRepository } from '../../pagamento/infrastructure/adapters/pagamentoRepository.js';
import { PagamentoAppService } from '../../pagamento/application/services/pagamentoService.js';

// Avaliacao
import { AvaliacaoRepository } from '../../avaliacao/infrastructure/adapters/avaliacaoRepository.js';
import { AvaliacaoAppService } from '../../avaliacao/application/services/avaliacaoService.js';

// Recomendacao
import { GrpcRecomendacaoProvider } from '../../recomendacao/infrastructure/adapters/grpcRecomendacaoProvider.js';

// Use Cases
import { ConfirmarPedidoUseCase } from '../../pedido/application/use-cases/ConfirmarPedidoUseCase.js';
import { AtribuirEntregadorUseCase } from '../../entrega/application/use-cases/AtribuirEntregadorUseCase.js';
import { AssinarPlanoRecomendacaoUseCase } from '../../recomendacao/application/use-cases/AssinarPlanoRecomendacaoUseCase.js';
import { AtribuirMelhorEntregadorUseCase } from '../../entrega/application/use-cases/AtribuirMelhorEntregadorUseCase.js';
import { SimularDeslocamentoUseCase } from '../../entrega/application/use-cases/SimularDeslocamentoUseCase.js';
import { ProcessarPagamentoUseCase } from '../../pagamento/application/use-cases/ProcessarPagamentoUseCase.js';
import { LoginUsuarioUseCase } from '../../usuario/application/use-cases/LoginUsuarioUseCase.js';
import { AtualizarEnderecoUsuarioUseCase } from '../../usuario/application/use-cases/AtualizarEnderecoUsuarioUseCase.js';
import { PovoarFrotaUseCase } from '../../entregador/application/use-cases/PovoarFrotaUseCase.js';
import { AtualizarLocalizacaoEntregadorUseCase } from '../../entregador/application/use-cases/AtualizarLocalizacaoEntregadorUseCase.js';
import { ObterRotaEstavelUseCase } from '../../entrega/application/use-cases/ObterRotaEstavelUseCase.js';
import { ObterRotaColetaUseCase } from '../../entrega/application/use-cases/ObterRotaColetaUseCase.js';
import { ObterRotaEntregaUseCase } from '../../entrega/application/use-cases/ObterRotaEntregaUseCase.js';
import { ObterInsightsUseCase } from '../../recomendacao/application/use-cases/ObterInsightsUseCase.js';
import { rabbitMQPublisher } from './messaging/rabbitmqPublisher.js';

export class DIContainer {
  private _jwtTokenService?: JwtTokenService;

  // Repositories
  private _usuarioRepository?: UsuarioRepository;
  private _restauranteRepository?: RestauranteRepository;
  private _produtoRepository?: ProdutoRepository;
  private _categoriaRepository?: CategoriaRepository;
  private _pedidoRepository?: PedidoRepository;
  private _itemPedidoRepository?: ItemPedidoRepository;
  private _roteamentoProvider?: GrpcRoteamentoProvider;
  private _entregadorRepository?: EntregadorRepository;
  private _entregaRepository?: EntregaRepository;
  private _pagamentoRepository?: PagamentoRepository;
  private _avaliacaoRepository?: AvaliacaoRepository;
  private _recomendacaoProvider?: GrpcRecomendacaoProvider;

  // Services
  private _usuarioService?: UsuarioAppService;
  private _restauranteService?: RestauranteAppService;
  private _produtoService?: ProdutoAppService;
  private _categoriaService?: CategoriaAppService;
  private _pedidoService?: PedidoAppService;
  private _itemPedidoService?: ItemPedidoAppService;
  private _roteamentoService?: RoteamentoAppService;
  private _entregadorService?: EntregadorAppService;
  private _entregaService?: EntregaAppService;
  private _pagamentoService?: PagamentoAppService;
  private _avaliacaoService?: AvaliacaoAppService;


  // Use Cases Cache
  private _confirmarPedidoUseCase?: ConfirmarPedidoUseCase;
  private _atribuirEntregadorUseCase?: AtribuirEntregadorUseCase;
  private _assinarPlanoRecomendacaoUseCase?: AssinarPlanoRecomendacaoUseCase;
  private _atribuirMelhorEntregadorUseCase?: AtribuirMelhorEntregadorUseCase;
  private _simularDeslocamentoUseCase?: SimularDeslocamentoUseCase;
  private _processarPagamentoUseCase?: ProcessarPagamentoUseCase;
  private _loginUsuarioUseCase?: LoginUsuarioUseCase;
  private _atualizarEnderecoUsuarioUseCase?: AtualizarEnderecoUsuarioUseCase;
  private _povoarFrotaUseCase?: PovoarFrotaUseCase;
  private _atualizarLocalizacaoEntregadorUseCase?: AtualizarLocalizacaoEntregadorUseCase;
  private _obterRotaEstavelUseCase?: ObterRotaEstavelUseCase;
  private _obterRotaColetaUseCase?: ObterRotaColetaUseCase;
  private _obterRotaEntregaUseCase?: ObterRotaEntregaUseCase;
  private _obterInsightsUseCase?: ObterInsightsUseCase;

  getJwtTokenService(): JwtTokenService {
    if (!this._jwtTokenService) {
      this._jwtTokenService = new JwtTokenService();
    }
    return this._jwtTokenService;
  }

  // Repositories Getters
  getUsuarioRepository(): UsuarioRepository {
    if (!this._usuarioRepository) {
      this._usuarioRepository = new UsuarioRepository();
    }
    return this._usuarioRepository;
  }

  getRestauranteRepository(): RestauranteRepository {
    if (!this._restauranteRepository) {
      this._restauranteRepository = new RestauranteRepository();
    }
    return this._restauranteRepository;
  }

  getProdutoRepository(): ProdutoRepository {
    if (!this._produtoRepository) {
      this._produtoRepository = new ProdutoRepository();
    }
    return this._produtoRepository;
  }

  getCategoriaRepository(): CategoriaRepository {
    if (!this._categoriaRepository) {
      this._categoriaRepository = new CategoriaRepository();
    }
    return this._categoriaRepository;
  }

  getPedidoRepository(): PedidoRepository {
    if (!this._pedidoRepository) {
      this._pedidoRepository = new PedidoRepository();
    }
    return this._pedidoRepository;
  }

  getItemPedidoRepository(): ItemPedidoRepository {
    if (!this._itemPedidoRepository) {
      this._itemPedidoRepository = new ItemPedidoRepository();
    }
    return this._itemPedidoRepository;
  }

  getRoteamentoProvider(): GrpcRoteamentoProvider {
    if (!this._roteamentoProvider) {
      this._roteamentoProvider = new GrpcRoteamentoProvider();
    }
    return this._roteamentoProvider;
  }

  getEntregadorRepository(): EntregadorRepository {
    if (!this._entregadorRepository) {
      this._entregadorRepository = new EntregadorRepository();
    }
    return this._entregadorRepository;
  }

  getEntregaRepository(): EntregaRepository {
    if (!this._entregaRepository) {
      this._entregaRepository = new EntregaRepository();
    }
    return this._entregaRepository;
  }

  getPagamentoRepository(): PagamentoRepository {
    if (!this._pagamentoRepository) {
      this._pagamentoRepository = new PagamentoRepository();
    }
    return this._pagamentoRepository;
  }

  getAvaliacaoRepository(): AvaliacaoRepository {
    if (!this._avaliacaoRepository) {
      this._avaliacaoRepository = new AvaliacaoRepository();
    }
    return this._avaliacaoRepository;
  }

  // Services Getters
  getUsuarioService(): UsuarioAppService {
    if (!this._usuarioService) {
      this._usuarioService = new UsuarioAppService(
        this.getUsuarioRepository()
      );
    }
    return this._usuarioService;
  }

  getRestauranteService(): RestauranteAppService {
    if (!this._restauranteService) {
      this._restauranteService = new RestauranteAppService(
        this.getRestauranteRepository()
      );
    }
    return this._restauranteService;
  }

  getProdutoService(): ProdutoAppService {
    if (!this._produtoService) {
      this._produtoService = new ProdutoAppService(
        this.getProdutoRepository()
      );
    }
    return this._produtoService;
  }

  getCategoriaService(): CategoriaAppService {
    if (!this._categoriaService) {
      this._categoriaService = new CategoriaAppService(
        this.getCategoriaRepository()
      );
    }
    return this._categoriaService;
  }

  getPedidoService(): PedidoAppService {
    if (!this._pedidoService) {
      this._pedidoService = new PedidoAppService(
        this.getPedidoRepository(),
        this.getUsuarioService()
      );
    }
    return this._pedidoService;
  }

  getItemPedidoService(): ItemPedidoAppService {
    if (!this._itemPedidoService) {
      this._itemPedidoService = new ItemPedidoAppService(
        this.getItemPedidoRepository()
      );
    }
    return this._itemPedidoService;
  }

  getRoteamentoService(): RoteamentoAppService {
    if (!this._roteamentoService) {
      this._roteamentoService = new RoteamentoAppService(
        this.getRoteamentoProvider()
      );
    }
    return this._roteamentoService;
  }

  getEntregadorService(): EntregadorAppService {
    if (!this._entregadorService) {
      this._entregadorService = new EntregadorAppService(
        this.getEntregadorRepository(),
        this.getRestauranteService()
      );
    }
    return this._entregadorService;
  }

  getEntregaService(): EntregaAppService {
    if (!this._entregaService) {
      this._entregaService = new EntregaAppService(
        this.getEntregaRepository()
      );
    }
    return this._entregaService;
  }

  getPagamentoService(): PagamentoAppService {
    if (!this._pagamentoService) {
      this._pagamentoService = new PagamentoAppService(
        this.getPagamentoRepository(),
        this.getPedidoRepository(),
        this.getUsuarioService(),
        rabbitMQPublisher
      );
    }
    return this._pagamentoService;
  }

  getAvaliacaoService(): AvaliacaoAppService {
    if (!this._avaliacaoService) {
      this._avaliacaoService = new AvaliacaoAppService(
        this.getAvaliacaoRepository()
      );
    }
    return this._avaliacaoService;
  }

  getRecomendacaoProvider(): GrpcRecomendacaoProvider {
    if (!this._recomendacaoProvider) {
      this._recomendacaoProvider = new GrpcRecomendacaoProvider();
    }
    return this._recomendacaoProvider;
  }

  getConfirmarPedidoUseCase(): ConfirmarPedidoUseCase {
    if (!this._confirmarPedidoUseCase) {
      this._confirmarPedidoUseCase = new ConfirmarPedidoUseCase(
        this.getPedidoRepository(),
        this.getUsuarioService(),
        rabbitMQPublisher
      );
    }
    return this._confirmarPedidoUseCase;
  }

  getAtribuirEntregadorUseCase(): AtribuirEntregadorUseCase {
    if (!this._atribuirEntregadorUseCase) {
      this._atribuirEntregadorUseCase = new AtribuirEntregadorUseCase(
        this.getEntregaRepository()
      );
    }
    return this._atribuirEntregadorUseCase;
  }

  getAssinarPlanoRecomendacaoUseCase(): AssinarPlanoRecomendacaoUseCase {
    if (!this._assinarPlanoRecomendacaoUseCase) {
      this._assinarPlanoRecomendacaoUseCase = new AssinarPlanoRecomendacaoUseCase(
        this.getRecomendacaoProvider()
      );
    }
    return this._assinarPlanoRecomendacaoUseCase;
  }

  getAtribuirMelhorEntregadorUseCase(): AtribuirMelhorEntregadorUseCase {
    if (!this._atribuirMelhorEntregadorUseCase) {
      this._atribuirMelhorEntregadorUseCase = new AtribuirMelhorEntregadorUseCase(
        this.getEntregaRepository(),
        this.getPedidoService(),
        this.getRestauranteService(),
        this.getEntregadorService(),
        this.getRoteamentoService()
      );
    }
    return this._atribuirMelhorEntregadorUseCase;
  }

  getSimularDeslocamentoUseCase(): SimularDeslocamentoUseCase {
    if (!this._simularDeslocamentoUseCase) {
      this._simularDeslocamentoUseCase = new SimularDeslocamentoUseCase(
        this.getEntregaRepository(),
        this.getPedidoService(),
        this.getEntregadorService(),
        this.getRestauranteService(),
        this.getObterRotaEstavelUseCase()
      );
    }
    return this._simularDeslocamentoUseCase;
  }

  getProcessarPagamentoUseCase(): ProcessarPagamentoUseCase {
    if (!this._processarPagamentoUseCase) {
      this._processarPagamentoUseCase = new ProcessarPagamentoUseCase(
        this.getPagamentoRepository(),
        this.getPedidoRepository(),
        this.getUsuarioService(),
        rabbitMQPublisher
      );
    }
    return this._processarPagamentoUseCase;
  }

  getLoginUsuarioUseCase(): LoginUsuarioUseCase {
    if (!this._loginUsuarioUseCase) {
      this._loginUsuarioUseCase = new LoginUsuarioUseCase(
        this.getUsuarioRepository(),
        this.getJwtTokenService()
      );
    }
    return this._loginUsuarioUseCase;
  }

  getAtualizarEnderecoUsuarioUseCase(): AtualizarEnderecoUsuarioUseCase {
    if (!this._atualizarEnderecoUsuarioUseCase) {
      this._atualizarEnderecoUsuarioUseCase = new AtualizarEnderecoUsuarioUseCase(
        this.getUsuarioRepository()
      );
    }
    return this._atualizarEnderecoUsuarioUseCase;
  }

  getPovoarFrotaUseCase(): PovoarFrotaUseCase {
    if (!this._povoarFrotaUseCase) {
      this._povoarFrotaUseCase = new PovoarFrotaUseCase(
        this.getEntregadorRepository(),
        this.getRoteamentoProvider(),
        this.getEntregadorService()
      );
    }
    return this._povoarFrotaUseCase;
  }

  getAtualizarLocalizacaoEntregadorUseCase(): AtualizarLocalizacaoEntregadorUseCase {
    if (!this._atualizarLocalizacaoEntregadorUseCase) {
      this._atualizarLocalizacaoEntregadorUseCase = new AtualizarLocalizacaoEntregadorUseCase(
        this.getEntregadorRepository()
      );
    }
    return this._atualizarLocalizacaoEntregadorUseCase;
  }

  getObterRotaEstavelUseCase(): ObterRotaEstavelUseCase {
    if (!this._obterRotaEstavelUseCase) {
      this._obterRotaEstavelUseCase = new ObterRotaEstavelUseCase(
        this.getEntregaRepository(),
        this.getPedidoService(),
        this.getEntregadorService(),
        this.getRestauranteService(),
        this.getRoteamentoService()
      );
    }
    return this._obterRotaEstavelUseCase;
  }

  getObterRotaColetaUseCase(): ObterRotaColetaUseCase {
    if (!this._obterRotaColetaUseCase) {
      this._obterRotaColetaUseCase = new ObterRotaColetaUseCase(
        this.getEntregaRepository(),
        this.getPedidoService(),
        this.getEntregadorService(),
        this.getRestauranteService(),
        this.getRoteamentoService()
      );
    }
    return this._obterRotaColetaUseCase;
  }

  getObterRotaEntregaUseCase(): ObterRotaEntregaUseCase {
    if (!this._obterRotaEntregaUseCase) {
      this._obterRotaEntregaUseCase = new ObterRotaEntregaUseCase(
        this.getEntregaRepository(),
        this.getPedidoService(),
        this.getEntregadorService(),
        this.getRestauranteService(),
        this.getRoteamentoService()
      );
    }
    return this._obterRotaEntregaUseCase;
  }

  getObterInsightsUseCase(): ObterInsightsUseCase {
    if (!this._obterInsightsUseCase) {
      this._obterInsightsUseCase = new ObterInsightsUseCase(
        this.getRecomendacaoProvider()
      );
    }
    return this._obterInsightsUseCase;
  }
}

export const diContainer = new DIContainer();
