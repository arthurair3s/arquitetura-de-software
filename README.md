# 📦 Express Delivery - Real-time Microservices Simulation

Este projeto é um ecossistema de alta performance projetado para demonstrar a aplicação prática de arquiteturas modernas e escaláveis. Desenvolvido com foco em **Microserviços**, **Comunicação gRPC** e **Geoprocessamento**, o foco principal reside na implementação de padrões de resiliência e baixa latência em sistemas distribuídos..

---

## 🏛️ Arquitetura do Sistema (Modelo C4)

Utilizamos o Modelo C4 para descrever a estrutura do sistema, permitindo visualizar desde a interação de alto nível do usuário até os detalhes de componentes e Clean Architecture de forma nativa e integrada.

### Nível 1: Contexto do Sistema (System Context)
O sistema atua como o orquestrador central entre os usuários finais, a frota de entregadores simulada e o motor de roteamento geográfico (OSRM).

```mermaid
graph TD
    %% Estilos de Elemento C4
    classDef person fill:#08427b,stroke:#052e56,stroke-width:2px,color:#ffffff;
    classDef system fill:#1168bd,stroke:#0e5aab,stroke-width:2px,color:#ffffff;
    classDef ext fill:#999999,stroke:#777777,stroke-width:2px,color:#ffffff;

    cliente["Cliente<br/>(Utiliza o sistema para pedir e rastrear entregas em tempo real)"]
    entregador["Entregador<br/>(Atualiza GPS e gerencia status de suas entregas)"]
    express_delivery["Sistema Express Delivery<br/>(Orquestra pedidos, rotas, frotas e pagamentos)"]
    osrm_server["Servidor OSRM<br/>[Sistema Externo]<br/>Calcula rotas ideais sobre dados do OpenStreetMap"]

    cliente -->|Visualiza cardápios, faz pedidos| express_delivery
    entregador -->|Envia localização, status de entregas| express_delivery
    express_delivery -->|Consulta rotas ideais e estimativas| osrm_server

    class cliente,entregador person;
    class express_delivery system;
    class osrm_server ext;
```

### Nível 2: Contêineres (Containers)
Detalhamento da topologia de containers do ecossistema. Todo o tráfego externo é centralizado pelo **API Gateway (Kong)**, que atua como o ponto de entrada único (Single Point of Entry) na porta 8000, roteando as requisições para o Frontend ou para a API conforme o path.

```mermaid
graph TB
    %% Estilos de Elemento C4
    classDef person fill:#08427b,stroke:#052e56,stroke-width:2px,color:#ffffff;
    classDef container fill:#438dd5,stroke:#3b7bb5,stroke-width:2px,color:#ffffff;
    classDef database fill:#1168bd,stroke:#0e5aab,stroke-width:2px,color:#ffffff;
    classDef ext fill:#999999,stroke:#777777,stroke-width:2px,color:#ffffff;

    cliente["Cliente<br/>(Visualiza cardápios e faz pedidos)"]
    entregador["Entregador<br/>(Atualiza GPS e aceita corridas)"]

    subgraph express_delivery ["Fronteira do Sistema Express Delivery"]
        frontend["Frontend Web<br/>[React + Vite]<br/>Interface de usuário SPA moderna"]
        gateway["API Gateway<br/>[Kong]<br/>Autenticação JWT, CORS e Roteamento"]
        api_node["Backend Core (API Node)<br/>[TypeScript / GraphQL / Prisma]<br/>Regras de negócio e gRPC client principal"]
        ms_entregadores["MS Entregadores<br/>[C# / .NET 10 / gRPC]<br/>Gerencia frota e posições geográficas"]
        ms_roteamento["MS Roteamento<br/>[C# / .NET 10 / gRPC]<br/>Calcula trajetos ótimos e estimativas"]
        db_postgres[("PostgreSQL<br/>[Dados Relacionais]<br/>Persistência de pedidos, usuários e cadastros")]
        db_redis[("Redis Cache<br/>[Geoprocessamento]<br/>Localizações geográficas de alta frequência")]
    end

    subgraph infra_osrm ["Infraestrutura de Mapas"]
        osrm_server["Servidor OSRM<br/>[C++ Engine]<br/>Processa matrizes geográficas e rotas"]
    end

    cliente -->|Interage| frontend
    frontend -->|Requisições GraphQL| gateway
    entregador -->|gRPC Coordinates Stream| ms_entregadores
    gateway -->|Roteia /graphql| api_node
    api_node -->|Consultas e Escrita| db_postgres
    api_node -->|gRPC: Atribuir entregador| ms_entregadores
    api_node -->|gRPC: Solicitar rota| ms_roteamento
    ms_entregadores -->|Persiste cadastros| db_postgres
    ms_entregadores -->|Cache de posições rápidas| db_redis
    ms_roteamento -->|Cálculo de caminhos e distâncias| osrm_server

    class cliente,entregador person;
    class frontend,gateway,api_node,ms_entregadores,ms_roteamento container;
    class db_postgres,db_redis database;
    class osrm_server ext;
```

### Nível 3: Componentes (Components)
Detalhamento interno do container **Backend Core (API Node)**, ilustrando como a arquitetura limpa (Clean Architecture) e o isolamento de domínio (DDD) são estruturados em camadas independentes.

```mermaid
graph TB
    %% Estilos de Elemento C4
    classDef container fill:#438dd5,stroke:#3b7bb5,stroke-width:2px,color:#ffffff;
    classDef component fill:#85bbf0,stroke:#6699cc,stroke-width:2px,color:#000000;
    classDef ext fill:#999999,stroke:#777777,stroke-width:2px,color:#ffffff;

    gateway["API Gateway (Kong)"]
    db_postgres[("PostgreSQL")]
    ms_entregadores["MS Entregadores"]
    ms_roteamento["MS Roteamento"]

    subgraph api_node ["Backend Core (API Node)"]
        subgraph layer_pres ["Camada de Apresentação"]
            resolvers["GraphQL Resolvers<br/>[Apollo Server]<br/>Trata queries e mutations de entrada"]
        end

        subgraph layer_app ["Camada de Aplicação"]
            validators["Validadores Zod<br/>[Schema Parsing]<br/>Garante integridade de inputs"]
            app_services["Serviços de Aplicação<br/>[TypeScript Classes]<br/>Orquestram os fluxos e casos de uso"]
        end

        subgraph layer_domain ["Camada de Domínio (Core)"]
            entities["Entidades de Domínio<br/>[Entities]<br/>Usuario, Pedido, Restaurante ricos"]
            value_objects["Value Objects<br/>[Value Objects]<br/>Email, Coordenada, Dinheiro imutáveis"]
            domain_ports["Portas / Interfaces<br/>[Ports]<br/>Contratos abstratos de repositórios/gRPC"]
        end

        subgraph layer_infra ["Camada de Infraestrutura"]
            prisma_adapters["Prisma Adapters<br/>[Repositories]<br/>Implementa portas de banco no Postgres"]
            grpc_providers["gRPC Providers<br/>[gRPC Clients]<br/>Implementa portas gRPC com microserviços"]
            token_service["Token Service<br/>[jsonwebtoken]<br/>Geração e verificação de JWTs"]
        end
    end

    gateway -->|Requisições HTTP GraphQL| resolvers
    resolvers -->|Valida parâmetros| validators
    resolvers -->|Invoca fluxos de aplicação| app_services
    app_services -->|Manipula entidades ricas| entities
    app_services -->|Valida e instancia| value_objects
    app_services -->|Interface de injeção| domain_ports

    prisma_adapters -.->|Realiza Herança/Implements| domain_ports
    grpc_providers -.->|Realiza Herança/Implements| domain_ports
    token_service -.->|Realiza Herança/Implements| domain_ports

    prisma_adapters -->|Prisma Client SQL| db_postgres
    grpc_providers -->|gRPC Channel| ms_entregadores
    grpc_providers -->|gRPC Channel| ms_roteamento

    class gateway,ms_entregadores,ms_roteamento container;
    class db_postgres ext;
    class resolvers,validators,app_services,entities,value_objects,domain_ports,prisma_adapters,grpc_providers,token_service component;
```

---

## 🚀 Como Rodar o Projeto

A aplicação é totalmente conteinerizada com **Docker**. Siga os passos abaixo:

### 1. Pré-requisitos
*   Docker e Docker Compose instalado.
*   Pelo menos 8GB de RAM livre (para o servidor de roteamento OSRM).

### 2. Preparando os Dados de Mapa (OSRM)
1. **Download**: Baixe o mapa do Brasil ou apenas a região Sudeste em [Geofabrik](https://download.geofabrik.de/south-america/brazil.html) (`sudeste-latest.osm.pbf`).
2. **Compilação**: Coloque o arquivo em `./osrm-data/` e execute:
   ```bash
   docker run -t -v "${PWD}/osrm-data:/data" osrm/osrm-backend osrm-extract -p /opt/car.lua /data/seu-arquivo.osm.pbf
   docker run -t -v "${PWD}/osrm-data:/data" osrm/osrm-backend osrm-partition /data/seu-arquivo.osrm
   docker run -t -v "${PWD}/osrm-data:/data" osrm/osrm-backend osrm-customize /data/seu-arquivo.osrm
   ```
3. **Configuração**: Verifique se o nome do arquivo no `compose.yml` (`osrm-server`) condiz com o arquivo gerado (ex: `sudeste-260326.osrm`).

### 3. Execução
```bash
cp .env.example .env
docker compose up --build
```

---

## 🕹️ Manual de Voo: Guia de Simulação

1.  **Acesso**: Acesse `http://localhost:8000`. (O tráfego passa pelo Kong Gateway).
2.  **Login**: Registre-se e faça login. Seu endereço servirá de destino para as entregas.
3.  **Radar**: Observe os entregadores se movendo no mapa. Eles atualizam o **Redis** a cada 3 segundos.
4.  **Compra**: Escolha um restaurante e clique em "Comprar".
5.  **Painel Técnico**: No menu lateral, simule as ações do motoboy para ver o rastreamento em tempo real via **gRPC** e **OSRM**.

> [!CAUTION]
> **Persistência de Dados**: O arquivo `compose.yml` está configurado com `--force-reset`. Isso garante que o ambiente de teste sempre inicie em um estado limpo e controlado.

---

## 🛠️ Stack Tecnológica

| Componente | Tecnologia | Papel |
| :--- | :--- | :--- |
| **Frontend** | React, Leaflet | UI moderna e visualização de geoprocessamento |
| **Gateway** | Kong Gateway | Porta de entrada profissional, JWT e Rate Limit |
| **API Principal** | Node.js, GraphQL | Orquestração de Microserviços e Schema unificado |
| **Microserviços** | .NET 10 (C#), gRPC | Performance extrema e lógica de negócio |
| **Dados** | PostgreSQL, Redis | Persistência relacional e cache de localização ultra-rápido |
| **Roteamento** | OSRM Engine | Inteligência logística baseada em OpenStreetMap |

---

## 📡 Endpoints de Acesso (Via Gateway)
*   **Aplicação Web (Frontend)**: [http://localhost:8000](http://localhost:8000)
*   **GraphQL Playground (API)**: [http://localhost:8000/graphql](http://localhost:8000/graphql)
*   **OSRM (Direto)**: [http://localhost:5080](http://localhost:5080)

---

## 🚧 Status e Visão de Futuro (Roadmap)

Este projeto está em desenvolvimento contínuo, servindo como um **laboratório vivo de arquitetura de software**. O objetivo é consolidar tanto conceitos fundamentais quanto as tendências de mercado mais avançadas.

### Próximas Evoluções Planejadas:
*   **Mensageria & Resiliência**: Implementação de comunicação assíncrona com **RabbitMQ** e padrões de tolerância a falhas (Circuit Breaker).
*   **Checkout & Pagamentos**: Integração de um gateway profissional (Stripe) para simulação de fluxos financeiros reais.
*   **Qualidade & Design**: Refatoração profunda aplicando **Domain-Driven Design (DDD)** e princípios **SOLID**.
*   **Escalabilidade**: Expansão da malha com novos microserviços especializados.
*   **Documentação Avançada**: Evolução completa do Modelo C4 até o nível de código.

---
*Este projeto demonstra o compromisso com a excelência técnica e a paixão por arquiteturas de software complexas.*
