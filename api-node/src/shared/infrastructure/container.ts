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
import { RotaEntregaService } from '../../entrega/application/services/rotaEntregaService.js';
import { AtribuicaoEntregaService } from '../../entrega/application/services/atribuicaoEntregaService.js';
import { SimuladorDeslocamentoService } from '../../entrega/application/services/simuladorDeslocamentoService.js';

// Pagamento
import { PagamentoRepository } from '../../pagamento/infrastructure/adapters/pagamentoRepository.js';
import { PagamentoAppService } from '../../pagamento/application/services/pagamentoService.js';

// Avaliacao
import { AvaliacaoRepository } from '../../avaliacao/infrastructure/adapters/avaliacaoRepository.js';
import { AvaliacaoAppService } from '../../avaliacao/application/services/avaliacaoService.js';

// Recomendacao
import { GrpcRecomendacaoProvider } from '../../recomendacao/infrastructure/adapters/grpcRecomendacaoProvider.js';
import { RecomendacaoAppService } from '../../recomendacao/application/services/recomendacaoService.js';

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
  private _rotaEntregaService?: RotaEntregaService;
  private _atribuicaoEntregaService?: AtribuicaoEntregaService;
  private _simuladorDeslocamentoService?: SimuladorDeslocamentoService;
  private _pagamentoService?: PagamentoAppService;
  private _avaliacaoService?: AvaliacaoAppService;
  private _recomendacaoService?: RecomendacaoAppService;

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
        this.getUsuarioRepository(),
        this.getJwtTokenService()
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
        this.getRestauranteService(),
        this.getRoteamentoProvider()
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

  getRotaEntregaService(): RotaEntregaService {
    if (!this._rotaEntregaService) {
      this._rotaEntregaService = new RotaEntregaService(
        this.getEntregaService(),
        this.getPedidoService(),
        this.getEntregadorService(),
        this.getRestauranteService(),
        this.getRoteamentoService()
      );
    }
    return this._rotaEntregaService;
  }

  getAtribuicaoEntregaService(): AtribuicaoEntregaService {
    if (!this._atribuicaoEntregaService) {
      this._atribuicaoEntregaService = new AtribuicaoEntregaService(
        this.getEntregaService(),
        this.getPedidoService(),
        this.getRestauranteService(),
        this.getEntregadorService(),
        this.getRoteamentoService()
      );
    }
    return this._atribuicaoEntregaService;
  }

  getSimuladorDeslocamentoService(): SimuladorDeslocamentoService {
    if (!this._simuladorDeslocamentoService) {
      this._simuladorDeslocamentoService = new SimuladorDeslocamentoService(
        this.getEntregaService(),
        this.getPedidoService(),
        this.getEntregadorService(),
        this.getRestauranteService(),
        this.getRotaEntregaService()
      );
    }
    return this._simuladorDeslocamentoService;
  }

  getPagamentoService(): PagamentoAppService {
    if (!this._pagamentoService) {
      this._pagamentoService = new PagamentoAppService(
        this.getPagamentoRepository()
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

  getRecomendacaoService(): RecomendacaoAppService {
    if (!this._recomendacaoService) {
      this._recomendacaoService = new RecomendacaoAppService(
        this.getRecomendacaoProvider()
      );
    }
    return this._recomendacaoService;
  }
}

export const diContainer = new DIContainer();
