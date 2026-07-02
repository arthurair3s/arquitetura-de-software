import pgPkg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import prismaPkg from '@prisma/client'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'

const { Pool } = pgPkg
const { PrismaClient } = prismaPkg

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://user:password@localhost:5432/delivery_db?schema=public'

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// =============================================================================
// RESTAURANTES — Altere latitude/longitude conforme necessário
// Coordenadas abaixo são de pontos reais em São Paulo (cobertos pelo OSRM)
// =============================================================================
const RESTAURANTES = [
  {
    nome: "Pizzaria Cachambi",
    descricao: 'Pizzas no forno a lenha, receita italiana original perto do Norte Shopping',
    endereco: 'Rua Cachambi, 340 - Cachambi, Rio de Janeiro',
    latitude: -22.8861,
    longitude: -43.2778
  },
  {
    nome: 'Sushi Maria da Graça',
    descricao: 'As melhores peças de salmão da ZN',
    endereco: 'Rua Conde de Azambuja, 200 - Maria da Graça, Rio de Janeiro',
    latitude: -22.8767,
    longitude: -43.2721
  },
  {
    nome: 'Lanchonete Bonsucesso',
    descricao: 'Lanches de rua e batata frita da melhor qualidade',
    endereco: 'Praça das Nações - Bonsucesso, Rio de Janeiro',
    latitude: -22.8631,
    longitude: -43.2554
  },
  {
    nome: "Braga's Burguer",
    descricao: 'Os melhores hambúrgueres artesanais de Higienópolis',
    endereco: 'Ten. Abel Cunha, 10B - Higienópolis, Rio de Janeiro',
    latitude: -22.877022,
    longitude: -43.256681
  },
  {
    nome: "Seafood Copacabana",
    descricao: 'Frutos do mar e vista para o mar',
    endereco: 'Av. Atlântica, 1000 - Copacabana, Rio de Janeiro',
    latitude: -22.9711,
    longitude: -43.1822
  },
  {
    nome: "Executivo do Centro",
    descricao: 'Um PF rápido e de qualidade para quem não tem tempo',
    endereco: 'Rua Uruguaiana, 50 - Centro, Rio de Janeiro',
    latitude: -22.9035,
    longitude: -43.1730
  },
  {
    nome: "Steakhouse da Barra",
    descricao: 'Cortes premium da Zona Oeste',
    endereco: 'Av. das Américas, 5000 - Barra da Tijuca, Rio de Janeiro',
    latitude: -23.0003,
    longitude: -43.3658
  },
  {
    nome: "Burger do Meier",
    descricao: 'Hambúrgueres artesanais suculentos no coração do Meier',
    endereco: 'Rua Dias da Cruz, 120 - Meier, Rio de Janeiro',
    latitude: -22.8996,
    longitude: -43.2795
  },
  {
    nome: "Cantina Don Giuseppe",
    descricao: 'Massas artesanais e vinhos selecionados',
    endereco: 'Rua Uruguai, 250 - Tijuca, Rio de Janeiro',
    latitude: -22.9248,
    longitude: -43.2389
  },
  {
    nome: "Salada & Cia Tijuca",
    descricao: 'Opções saudáveis, wraps e sucos naturais',
    endereco: 'Rua Conde de Bonfim, 340 - Tijuca, Rio de Janeiro',
    latitude: -22.9234,
    longitude: -43.2351
  }
]

// =============================================================================
// USUÁRIOS — Altere nome, email e telefone conforme necessário
// =============================================================================
const USUARIOS = [
  {
    nome: 'Ana Lima',
    email: 'ana.lima@email.com',
    telefone: '11999990001',
    senha: 'senha123',
    role: 'CLIENTE'
  },
  {
    nome: 'Carlos Mota',
    email: 'carlos.mota@email.com',
    telefone: '11999990002',
    senha: 'senha123',
    role: 'RESTAURANTE'
  },
  {
    nome: 'Roberto Silva',
    email: 'roberto.silva@email.com',
    telefone: '11999990004',
    senha: 'senha123',
    role: 'RESTAURANTE'
  },
  {
    nome: 'Patricia Costa',
    email: 'patricia.costa@email.com',
    telefone: '11999990005',
    senha: 'senha123',
    role: 'RESTAURANTE'
  },
  {
    nome: 'Fernanda Cruz',
    email: 'fernanda.cruz@email.com',
    telefone: '11999990003',
    senha: 'senha123',
    role: 'ENTREGADOR'
  },
  {
    nome: 'Rodrigo Santos',
    email: 'rodrigo.santos@email.com',
    telefone: '11999990006',
    senha: 'senha123',
    role: 'ENTREGADOR'
  },
  {
    nome: 'Juliana Rocha',
    email: 'juliana.rocha@email.com',
    telefone: '11999990007',
    senha: 'senha123',
    role: 'ENTREGADOR'
  }
]

// =============================================================================
// ENTREGADORES — Apenas dados cadastrais (Postgres)
// A posição geográfica é atualizada via gRPC stream (Redis), não via seed
// =============================================================================

/*
const ENTREGADORES = [
  {
    nome: 'Lucas Andrade',
    telefone: '11988880001',
    veiculo: 'Moto Honda CG 160'
  },
  {
    nome: 'Mariana Souza',
    telefone: '11988880002',
    veiculo: 'Bicicleta Elétrica'
  },
  {
    nome: 'Pedro Oliveira',
    telefone: '11988880003',
    veiculo: 'Moto Yamaha Factor 125'
  }
]
*/

// =============================================================================
// CATEGORIAS E PRODUTOS — Altere livremente
// =============================================================================
const CATEGORIAS_POR_RESTAURANTE = {
  'Pizzaria Cachambi': [
    {
      nome: 'Pizzas Salgadas',
      produtos: [
        { nome: 'Margherita', descricao: 'Mussarela e manjericão fresco', preco: 45.0 },
        { nome: 'Pepperoni', descricao: 'Pepperoni italiano importado', preco: 52.0 },
      ]
    }
  ],
  'Sushi Maria da Graça': [
    {
      nome: 'Combinados',
      produtos: [
        { nome: 'Combinado ZN', descricao: '12 peças: 6 niguiri + 6 hossomaki', preco: 49.9 },
        { nome: 'Temaki Salmão', descricao: 'Salmão fresco e cream cheese', preco: 22.9 }
      ]
    }
  ],
  'Lanchonete Bonsucesso': [
    {
      nome: 'Lanches',
      produtos: [
        { nome: 'X-Tudo', descricao: 'Pão, carne, ovo, bacon, calabresa', preco: 25.0 },
        { nome: 'Batata com Cheddar', descricao: 'Porção grande', preco: 18.0 }
      ]
    }
  ],
  "Braga's Burguer": [
    {
      nome: 'Hambúrgueres',
      produtos: [
        { nome: 'Classic Burger', descricao: 'Pão brioche, carne 180g', preco: 32.9 },
        { nome: 'Double Smash', descricao: 'Dois smash burgers', preco: 42.9 }
      ]
    }
  ],
  'Seafood Copacabana': [
    {
      nome: 'Grelhados',
      produtos: [
        { nome: 'Prato Feito Camarão', descricao: 'Acompanha salada e arroz', preco: 65.0 },
        { nome: 'Ceviche Fresco', descricao: 'Com peixe branco do dia', preco: 45.0 }
      ]
    }
  ],
  'Executivo do Centro': [
    {
      nome: 'Marmitas Premium',
      produtos: [
        { nome: 'Bife a Cavalo', descricao: 'Bife, arroz, feijão, fritas e ovo', preco: 35.0 },
        { nome: 'Frango Empanado', descricao: 'Acompanha talharim ao sugo', preco: 32.0 }
      ]
    }
  ],
  'Steakhouse da Barra': [
    {
      nome: 'Cortes Especiais',
      produtos: [
        { nome: 'Picanha Angus 500g', descricao: 'Acompanha batata rústica', preco: 150.0 },
        { nome: 'Bife Ancho', descricao: 'Corte uruguaio mal passado', preco: 120.0 }
      ]
    }
  ],
  'Burger do Meier': [
    {
      nome: 'Gourmet',
      produtos: [
        { nome: 'Meier Monster', descricao: 'Carne 200g, muito cheddar, cebola caramelizada', preco: 38.9 },
        { nome: 'Bacon Blast', descricao: 'Smash duplo com triplo bacon e maionese artesanal', preco: 36.9 }
      ]
    }
  ],
  'Cantina Don Giuseppe': [
    {
      nome: 'Massas Frestas',
      produtos: [
        { nome: 'Lasagna Bolognese', descricao: 'Massa fresca, molho bolognese da casa e queijo gratinado', preco: 55.0 },
        { nome: 'Gnocchi al Pesto', descricao: 'Gnocchi de batata ao molho pesto de manjericão e nozes', preco: 48.0 }
      ]
    }
  ],
  'Salada & Cia Tijuca': [
    {
      nome: 'Saudável',
      produtos: [
        { nome: 'Salada Ceasar', descricao: 'Alface americana, tiras de frango grelhado, croutons e molho ceasar', preco: 29.9 },
        { nome: 'Wrap Frango & Abacate', descricao: 'Wrap de trigo integral com frango, abacate, tomate e cream cheese', preco: 26.9 }
      ]
    }
  ]
}

// =============================================================================
// AVALIAÇÕES — nota de 1 a 5
// =============================================================================
const AVALIACOES_CONFIG = [
  {
    usuario_idx: 0,
    restaurante_idx: 0,
    nota: 5,
    comentario: 'Melhor hambúrguer que já comi!'
  },
  {
    usuario_idx: 1,
    restaurante_idx: 1,
    nota: 4,
    comentario: 'Sushi fresquíssimo, entrega rápida.'
  },
  {
    usuario_idx: 2,
    restaurante_idx: 2,
    nota: 5,
    comentario: 'Pizza como na Itália!'
  },
  {
    usuario_idx: 0,
    restaurante_idx: 1,
    nota: 3,
    comentario: 'Gostei, mas demorou um pouco.'
  }
]

// =============================================================================
// EXECUÇÃO DA SEED
// =============================================================================
async function main() {
  console.log('Iniciando seed do banco de dados...\n')

  // Limpa os dados existentes na ordem correta (respeitando FK) e reseta os IDs para 1
  console.log('Limpando dados anteriores e resetando IDs...')
  const tables = [
    'avaliacoes', 'itens_pedido', 'pagamentos', 'entregas', 
    'pedidos', 'produtos', 'categorias', 'restaurantes', 
    'usuarios'
  ];
  
  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`);
  }

  // Usuários (com hash de senha)
  console.log('Criando usuários (com senhas criptografadas)...')
  const usuarios = await Promise.all(
    USUARIOS.map(async u => {
      const hashedSenha = await bcrypt.hash(u.senha, 10)
      return prisma.usuarios.create({ data: { ...u, senha: hashedSenha } })
    })
  )

  // Restaurantes
  console.log('Criando restaurantes...')
  const restauranteMap = {}
  for (const dados of RESTAURANTES) {
    const r = await prisma.restaurantes.create({ data: dados })
    restauranteMap[dados.nome] = r
    console.log(
      `   ${r.nome} (id: ${r.id}) — lat: ${r.latitude}, lon: ${r.longitude}`
    )
  }

  // Vincular donos de restaurantes
  console.log('Vinculando donos de restaurantes...')
  const carlos = usuarios.find(u => u.email === 'carlos.mota@email.com')
  if (carlos) {
    await prisma.usuarios.update({
      where: { id: carlos.id },
      data: { restaurante_id: restauranteMap["Pizzaria Cachambi"].id }
    })
  }
  const roberto = usuarios.find(u => u.email === 'roberto.silva@email.com')
  if (roberto) {
    await prisma.usuarios.update({
      where: { id: roberto.id },
      data: { restaurante_id: restauranteMap["Sushi Maria da Graça"].id }
    })
  }
  const patricia = usuarios.find(u => u.email === 'patricia.costa@email.com')
  if (patricia) {
    await prisma.usuarios.update({
      where: { id: patricia.id },
      data: { restaurante_id: restauranteMap["Lanchonete Bonsucesso"].id }
    })
  }

  // Categorias e Produtos
  console.log('Criando categorias e produtos...')
  const todosProdutos = []
  for (const [nomeRestaurante, categorias] of Object.entries(
    CATEGORIAS_POR_RESTAURANTE
  )) {
    const restaurante = restauranteMap[nomeRestaurante]
    for (const cat of categorias) {
      const categoria = await prisma.categorias.create({
        data: { nome: cat.nome, restaurante_id: restaurante.id }
      })
      for (const prod of cat.produtos) {
        const produto = await prisma.produtos.create({
          data: { ...prod, categoria_id: categoria.id }
        })
        todosProdutos.push(produto)
      }
    }
  }

  // Entregadores
  /*
  console.log('Criando entregadores...')
  const entregadores = await Promise.all(
    ENTREGADORES.map(e => prisma.entregadores.create({ data: e }))
  )
  */
 
  // Pedidos (1 por usuário, em restaurantes diferentes)
  console.log('Criando pedidos...')
  const restaurantesArray = Object.values(restauranteMap)
  const pedidos = await Promise.all(
    usuarios.map((u, i) =>
      prisma.pedidos.create({
        data: {
          usuario_id: u.id,
          restaurante_id: restaurantesArray[i % restaurantesArray.length].id,
          status: 'PENDENTE',
          valor_total: 0,
          // Coordenadas reais no RJ (próximas aos restaurantes da seed)
          destino_latitude: -22.9068,
          destino_longitude: -43.1729
        }
      })
    )
  )

  // Itens de Pedido (2 itens por pedido, pegando produtos variados)
  console.log('Criando itens de pedido...')
  for (let i = 0; i < pedidos.length; i++) {
    const pedido = pedidos[i]
    const prod1 = todosProdutos[(i * 2) % todosProdutos.length]
    const prod2 = todosProdutos[(i * 2 + 1) % todosProdutos.length]
    const total = Number(prod1.preco) + Number(prod2.preco)

    await prisma.itens_pedido.createMany({
      data: [
        {
          pedido_id: pedido.id,
          produto_id: prod1.id,
          quantidade: 1,
          preco_unitario: prod1.preco
        },
        {
          pedido_id: pedido.id,
          produto_id: prod2.id,
          quantidade: 1,
          preco_unitario: prod2.preco
        }
      ]
    })

    await prisma.pedidos.update({
      where: { id: pedido.id },
      data: { valor_total: total }
    })
  }

  // Pagamentos
  console.log('Criando pagamentos...')
  await Promise.all(
    pedidos.map((p, i) =>
      prisma.pagamentos.create({
        data: {
          pedido_id: p.id,
          metodo: ['cartao_credito', 'pix', 'dinheiro'][i % 3],
          status: 'aprovado',
          valor: p.valor_total ?? 0
        }
      })
    )
  )

  // Entregas
  /*
  console.log('Criando entregas...')
  await Promise.all(
    pedidos.map((p, i) =>
      prisma.entregas.create({
        data: {
          pedido_id: p.id,
          entregador_id: entregadores[i % entregadores.length].id,
          status: 'ATRIBUIDA',
          previsao_entrega: new Date(Date.now() + (i + 1) * 30 * 60 * 1000)
        }
      })
    )
  )
  */

  // Avaliações
  console.log('Criando avaliações...')
  for (const av of AVALIACOES_CONFIG) {
    await prisma.avaliacoes.create({
      data: {
        usuario_id: usuarios[av.usuario_idx].id,
        restaurante_id: restaurantesArray[av.restaurante_idx].id,
        nota: av.nota,
        comentario: av.comentario
      }
    })
  }

  console.log('\n Seed concluída com sucesso!')
  console.log(`   ${usuarios.length} usuários`)
  console.log(`   ${restaurantesArray.length} restaurantes`)
  console.log(`   ${todosProdutos.length} produtos`)
  // console.log(`   ${entregadores.length} entregadores`) // Removido pois os entregadores são gerados dinamicamente
  console.log(`   ${pedidos.length} pedidos`)
  console.log(
    `\n Lembre-se: as posições dos entregadores no Redis precisam ser`
  )
  console.log(
    `   atualizadas via gRPC (AtualizarLocalizacaoStream) separadamente.`
  )
}

main()
  .catch(e => {
    console.error('Erro na seed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
