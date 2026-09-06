export const GET_RESTAURANTES = `
  query GetRestaurantes {
    restaurantes {
      id
      nome
      endereco
      latitude
      longitude
    }
  }
`;

export const GET_RESTAURANTE_MENU = `
  query GetRestauranteMenu($id: ID!) {
    restaurante(id: $id) {
      id
      nome
      categorias {
        id
        nome
        produtos {
          id
          nome
          descricao
          preco
        }
      }
    }
  }
`;

// O dono do pedido vem do token no backend — não é mais um argumento.
export const CRIAR_PEDIDO = `
  mutation CriarPedido($restaurante_id: ID!, $destino_latitude: Float, $destino_longitude: Float, $valor_total: Float) {
    criarPedido(
      restaurante_id: $restaurante_id,
      valor_total: $valor_total,
      destino_latitude: $destino_latitude,
      destino_longitude: $destino_longitude
    ) {
      id
      status
    }
  }
`;

export const ACOMPANHAR_PEDIDO = `
  query AcompanharPedido($id: ID!) {
    pedido(id: $id) {
      id
      status
      destino_latitude
      destino_longitude
      entregas {
        id
        status
        entregador {
          id
          nome
          latitude
          longitude
        }
        resumo_trajeto {
          distancia_km
          duracao_estimada_segundos
        }
        rota_coleta {
          caminho { latitude longitude }
          distancia_total_km
          duracao_total_segundos
        }
        rota_entrega {
          caminho { latitude longitude }
          distancia_total_km
          duracao_total_segundos
        }
        rota {
          caminho {
            latitude
            longitude
          }
        }
      }
    }
  }
`;

export const ATUALIZAR_STATUS_ENTREGA = `
  mutation AtualizarStatus($id: ID!, $status: String!) {
    editarEntrega(id: $id, status: $status) {
      id
      status
    }
  }
`;

export const MOVER_ENTREGADOR = `
  mutation MoverEntregador($id: ID!, $latitude: Float!, $longitude: Float!) {
    editarEntregador(id: $id, latitude: $latitude, longitude: $longitude) {
      id
    }
  }
`;

export const POVOAR_FROTA = `
  mutation PovoarFrota {
    povoarFrota
  }
`;

export const SIMULAR_DESLOCAMENTO = `
  mutation SimularDeslocamento($id: ID!) {
    simularDeslocamento(id: $id)
  }
`;

export const CRIAR_AVALIACAO = `
  mutation CriarAvaliacao($restaurante_id: ID!, $nota: Int, $comentario: String) {
    criarAvaliacao(restaurante_id: $restaurante_id, nota: $nota, comentario: $comentario) {
      id
    }
  }
`;

export const LOGIN = `
  mutation Login($email: String!, $senha: String!) {
    login(email: $email, senha: $senha) {
      token
      usuario {
        id
        nome
        email
        latitude
        longitude
        endereco
        role
        entregador_id
        restaurante_id
      }
    }
  }
`;

export const REGISTRO = `
  mutation Registro($nome: String!, $email: String!, $senha: String!, $telefone: String, $role: String, $entregador_id: Int, $restaurante_id: Int) {
    criarUsuario(nome: $nome, email: $email, senha: $senha, telefone: $telefone, role: $role, entregador_id: $entregador_id, restaurante_id: $restaurante_id) {
      id
      nome
      email
      role
      entregador_id
      restaurante_id
    }
  }
`;

export const ME = `
  query Me {
    me {
      id
      nome
      email
      latitude
      longitude
      endereco
      role
      entregador_id
      restaurante_id
    }
  }
`;

export const ATUALIZAR_ENDERECO = `
  mutation AtualizarEndereco($latitude: Float, $longitude: Float, $endereco: String!) {
    atualizarEndereco(latitude: $latitude, longitude: $longitude, endereco: $endereco) {
      id
      latitude
      longitude
      endereco
    }
  }
`;

export const BUSCAR_CANDIDATOS = `
  query BuscarCandidatos($restauranteId: ID!, $raioKm: Float!) {
    entregadoresProximosAoRestaurante(restauranteId: $restauranteId, raioKm: $raioKm) {
      id
      nome
      latitude
      longitude
    }
  }
`;

export const ATRIBUIR_ENTREGADOR = `
  mutation AtribuirEntregador($pedido_id: ID!) {
    atribuirEntregador(pedido_id: $pedido_id) {
      id
      status
    }
  }
`;

export const CRIAR_PAGAMENTO = `
  mutation CriarPagamento($pedido_id: ID!, $metodo: String!, $valor: Float!) {
    criarPagamento(pedido_id: $pedido_id, metodo: $metodo, valor: $valor) {
      id
      status
      valor
      metodo
    }
  }
`;

export const OBTER_INSIGHTS_LOJA = `
  query ObterInsightsLoja($restauranteId: Int!) {
    obterInsightsLoja(restauranteId: $restauranteId) {
      status
      plano
      restaurante
      concorrentesAnalisados
      insights {
        produtoId
        produtoNome
        precoAtual
        tipoSugestao
        sugestao
      }
    }
  }
`;

export const ATUALIZAR_ASSINATURA = `
  mutation AtualizarAssinaturaRecomendacao($restauranteId: Int!, $plano: String!) {
    atualizarAssinaturaRecomendacao(restauranteId: $restauranteId, plano: $plano) {
      restauranteId
      plano
      message
    }
  }
`;

export const GET_PEDIDOS_RESTAURANTE = `
  query GetPedidosRestaurante($restaurante_id: ID!) {
    pedidosPorRestaurante(restaurante_id: $restaurante_id) {
      id
      status
      valor_total
      destino_latitude
      destino_longitude
      data_criacao
      usuario {
        id
        nome
        endereco
      }
    }
  }
`;

export const EDITAR_STATUS_PEDIDO = `
  mutation EditarPedido($id: ID!, $status: String!) {
    editarPedido(id: $id, status: $status) {
      id
      status
    }
  }
`;

export const GET_ENTREGAS_PENDENTES = `
  query GetEntregasPendentes {
    entregasPendentes {
      id
      status
      pedido {
        id
        valor_total
        destino_latitude
        destino_longitude
        usuario {
          nome
          endereco
        }
      }
    }
  }
`;

export const ACEITAR_ENTREGA = `
  mutation AceitarEntrega($entrega_id: ID!) {
    aceitarEntrega(entrega_id: $entrega_id) {
      id
      status
      entregador {
        id
        nome
      }
    }
  }
`;

export const EDITAR_RESTAURANTE = `
  mutation EditarRestaurante($id: ID!, $nome: String, $descricao: String, $endereco: String, $latitude: Float, $longitude: Float) {
    editarRestaurante(id: $id, nome: $nome, descricao: $descricao, endereco: $endereco, latitude: $latitude, longitude: $longitude) {
      id
      nome
      descricao
      endereco
      latitude
      longitude
    }
  }
`;

export const CRIAR_PRODUTO = `
  mutation CriarProduto($nome: String!, $descricao: String, $preco: Float!, $categoria_id: ID) {
    criarProduto(nome: $nome, descricao: $descricao, preco: $preco, categoria_id: $categoria_id) {
      id
      nome
      preco
    }
  }
`;

export const DELETAR_PRODUTO = `
  mutation DeletarProduto($id: ID!) {
    deletarProduto(id: $id)
  }
`;

export const CRIAR_CATEGORIA = `
  mutation CriarCategoria($nome: String!, $restaurante_id: ID!) {
    criarCategoria(nome: $nome, restaurante_id: $restaurante_id) {
      id
      nome
    }
  }
`;

export const GET_ENTREGADOR_ENTREGAS = `
  query GetEntregadorEntregas($id: ID!) {
    entregador(id: $id) {
      id
      nome
      status
      latitude
      longitude
      entregas {
        id
        status
        pedido {
          id
          valor_total
          destino_latitude
          destino_longitude
          usuario {
            nome
            endereco
          }
        }
      }
    }
  }
`;

export const ATUALIZAR_STATUS_ENTREGADOR = `
  mutation AtualizarStatusEntregador($id: ID!, $novoStatus: StatusEntregador!) {
    atualizarStatusEntregador(id: $id, novoStatus: $novoStatus) {
      id
      status
    }
  }
`;

export const ATUALIZAR_LOCALIZACAO_ENTREGADOR = `
  mutation AtualizarLocalizacaoEntregador($id: ID!, $latitude: Float!, $longitude: Float!) {
    atualizarLocalizacaoEntregador(id: $id, latitude: $latitude, longitude: $longitude)
  }
`;

// Substitui o antigo GET_USER_PEDIDOS, que lia os pedidos por um id arbitrário.
export const GET_MEUS_PEDIDOS = `
  query GetMeusPedidos {
    meusPedidos {
      id
      status
      valor_total
      data_criacao
      restaurante_id
    }
  }
`;


