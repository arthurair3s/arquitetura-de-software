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
    lojista["Lojista (Restaurante)<br/>(Gerencia cardápios, produtos e visualiza insights competitivos)"]
    express_delivery["Sistema Express Delivery<br/>(Orquestra pedidos, rotas, frotas e pagamentos)"]
    osrm_server["Servidor OSRM<br/>[Sistema Externo]<br/>Calcula rotas ideais sobre dados do OpenStreetMap"]
    stripe["Gateway Stripe<br/>[Sistema Externo]<br/>Processa pagamentos com cartão e PIX de forma segura"]
    mailtrap["Servidor Mailtrap/SMTP<br/>[Sistema Externo]<br/>Dispara emails transacionais sobre status de pedidos"]

    cliente -->|Visualiza cardápios, faz pedidos| express_delivery
    entregador -->|Envia localização, status de entregas| express_delivery
    lojista -->|Gerencia estabelecimentos, cardápios e visualiza insights| express_delivery
    express_delivery -->|Consulta rotas ideais e estimativas| osrm_server
    express_delivery -->|Processa cobranças de pedidos| stripe
    express_delivery -->|Dispara e-mails transacionais| mailtrap

    class cliente,entregador,lojista person;
    class express_delivery system;
    class osrm_server,stripe,mailtrap ext;
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

    cliente["Cliente<br/>(Visualiza cardápios e faz pedidos no browser)"]
    entregador["Entregador<br/>(Atualiza GPS e aceita corridas)"]
    lojista["Lojista<br/>(Acessa o painel do restaurante no browser)"]

    frontend["Frontend Web<br/>[React + Vite]<br/>Interface de usuário SPA (Roda no dispositivo do cliente)"]

    subgraph private_backend ["Rede Privada / Servidores de Backend"]
        gateway["API Gateway (Kong)<br/>[Kong 3.4]<br/>Autenticação JWT, CORS e Roteamento de Borda"]
        api_node["Backend Core (API Node)<br/>[TypeScript / GraphQL / Prisma]<br/>Regras de negócio e gRPC client principal"]
        ms_entregadores["MS Entregadores<br/>[C# / .NET 10 / gRPC]<br/>Gerencia frota e posições geográficas"]
        ms_roteamento["MS Roteamento<br/>[C# / .NET 10 / gRPC]<br/>Calcula trajetos ótimos e estimativas"]
        ms_recomendacao["MS Recomendação<br/>[Python / FastAPI / gRPC]<br/>Gera insights analíticos de preços"]
        ms_notificacoes["MS Notificações<br/>[Python / pika / SMTP]<br/>Consome eventos e dispara emails"]
        db_postgres[("PostgreSQL Principal<br/>[Dados Relacionais]<br/>Persistência de pedidos, usuários e cadastros")]
        db_entregadores[("PostgreSQL Entregadores<br/>[Dados Relacionais]<br/>Banco isolado dos entregadores")]
        db_recomendacao[("PostgreSQL Recomendação<br/>[Dados Relacionais]<br/>Banco isolado de insights analíticos")]
        db_redis[("Redis Cache<br/>[Geoprocessamento]<br/>Localizações geográficas e cache-aside")]
        rabbitmq["RabbitMQ<br/>[Message Broker]<br/>Mensageria assíncrona entre serviços"]
        kafka_cdc["Kafka + Debezium<br/>[CDC Connect]<br/>Replicação de dados em tempo real"]
    end

    subgraph externals ["Serviços Externos"]
        osrm_server["Servidor OSRM<br/>[C++ Engine]<br/>Processa matrizes geográficas e rotas"]
        stripe["Gateway Stripe<br/>[External System]<br/>Processamento financeiro seguro"]
        mailtrap["Servidor Mailtrap<br/>[External System]<br/>Disparo de e-mails de teste"]
    end

    subgraph observability ["Observabilidade"]
        jaeger["Jaeger Tracing<br/>[Jaeger All-in-One]<br/>Traces distribuídos gRPC/GraphQL"]
        prometheus["Prometheus Metrics<br/>[Metrics Server]<br/>Métricas temporais"]
        grafana["Grafana Dashboards<br/>[Grafana OSS]<br/>Painéis analíticos unificados"]
    end

    cliente -->|Interage| frontend
    lojista -->|Interage| frontend
    frontend -->|Requisições GraphQL| gateway
    entregador -->|gRPC Coordinates Stream| ms_entregadores
    gateway -->|Roteia /graphql| api_node
    api_node -->|Consultas e Escrita| db_postgres
    api_node -->|Lê/grava cache| db_redis
    api_node -->|gRPC: Consultar entregadores| ms_entregadores
    api_node -->|gRPC: Solicitar rota| ms_roteamento
    api_node -->|gRPC: Insights de loja| ms_recomendacao
    api_node -->|Publica eventos| rabbitmq
    api_node -->|Processa pagamentos| stripe
    ms_entregadores -->|Persiste cadastros| db_entregadores
    ms_entregadores -->|Cache de posições rápidas| db_redis
    ms_entregadores -->|Publica/Consome| rabbitmq
    ms_roteamento -->|Cálculo de trajetos| osrm_server
    ms_recomendacao -->|Persiste dados| db_recomendacao
    ms_recomendacao -->|Consome eventos| rabbitmq
    ms_notificacoes -->|Consome eventos| rabbitmq
    ms_notificacoes -->|Dispara emails| mailtrap
    db_postgres -->|CDC WAL Logs| kafka_cdc
    kafka_cdc -->|Replicação de dados| ms_recomendacao

    %% Traces e Monitoramento
    api_node -->|Traces OTLP| jaeger
    ms_entregadores -->|Traces OTLP| jaeger
    ms_roteamento -->|Traces OTLP| jaeger
    ms_recomendacao -->|Traces OTLP| jaeger
    ms_notificacoes -->|Traces OTLP| jaeger
    prometheus -->|Scrape metrics| api_node
    grafana -->|Visualiza| prometheus
    grafana -->|Visualiza| jaeger

    class cliente,entregador,lojista person;
    class frontend,gateway,api_node,ms_entregadores,ms_roteamento,ms_recomendacao,ms_notificacoes,rabbitmq,kafka_cdc,jaeger,prometheus,grafana container;
    class db_postgres,db_entregadores,db_recomendacao,db_redis database;
    class osrm_server,stripe,mailtrap ext;
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
    db_redis[("Redis Cache")]
    rabbitmq["RabbitMQ"]
    ms_entregadores["MS Entregadores"]
    ms_roteamento["MS Roteamento"]
    ms_recomendacao["MS Recomendação"]

    subgraph api_node ["Backend Core (API Node)"]
        subgraph layer_pres ["Camada de Apresentação"]
            resolvers["GraphQL Resolvers<br/>[Apollo Server]<br/>Trata queries e mutations de entrada"]
        end

        subgraph layer_app ["Camada de Aplicação"]
            validators["Validadores Zod<br/>[Schema Parsing]<br/>Garante integridade de inputs"]
            confirmar_pedido_uc["ConfirmarPedidoUseCase<br/>[UseCase]<br/>Cria e confirma pedidos"]
            atribuir_entregador_uc["AtribuirEntregadorUseCase<br/>[UseCase]<br/>Registra entrega atribuída"]
            assinar_recomendacao_uc["AssinarPlanoRecomendacaoUseCase<br/>[UseCase]<br/>Gerencia planos premium"]
            povoar_frota_uc["PovoarFrotaUseCase<br/>[UseCase]<br/>Povoa e simula frota"]
            atualizar_localizacao_entregador_uc["AtualizarLocalizacaoEntregadorUseCase<br/>[UseCase]<br/>Valida/atualiza geo-posições"]
            obter_rota_estavel_uc["ObterRotaEstavelUseCase<br/>[UseCase]<br/>Calcula rotas de entregas"]
            obter_rota_coleta_uc["ObterRotaColetaUseCase<br/>[UseCase]<br/>Calcula rota de coleta"]
            obter_rota_entrega_uc["ObterRotaEntregaUseCase<br/>[UseCase]<br/>Calcula rota de entrega"]
            obter_insights_uc["ObterInsightsUseCase<br/>[UseCase]<br/>Busca insights via gRPC"]
            processar_pagamento_uc["ProcessarPagamentoUseCase<br/>[UseCase]<br/>Processa pagamentos via Stripe"]
            login_usuario_uc["LoginUsuarioUseCase<br/>[UseCase]<br/>Autentica usuário e emite JWT"]
            app_services["Serviços de Aplicação<br/>[TypeScript Classes]<br/>Serviços auxiliares legados/CRUDs"]
        end

        subgraph layer_domain ["Camada de Domínio (Core)"]
            entities["Entidades de Domínio<br/>[Entities]<br/>Usuario, Pedido, Restaurante ricos"]
            value_objects["Value Objects<br/>[Value Objects]<br/>Email, Coordenada, Dinheiro imutáveis"]
            domain_ports["Portas / Interfaces<br/>[Ports]<br/>Contratos abstratos de repositórios/gRPC/Messaging"]
        end

        subgraph layer_infra ["Camada de Infraestrutura"]
            prisma_adapters["Prisma Adapters<br/>[Repositories]<br/>Implementa portas de banco no Postgres"]
            grpc_providers["gRPC Providers<br/>[gRPC Clients]<br/>Implementa portas gRPC com microserviços"]
            rabbitmq_publisher["RabbitMQPublisher<br/>[Event Publisher]<br/>Dispara eventos assíncronos"]
            rabbitmq_consumer["RabbitMQConsumer<br/>[Background Worker]<br/>Consome eventos de filas"]
            redis_client["RedisClient Singleton<br/>[ioredis]<br/>Gerencia conexão e cache no Redis"]
            token_service["Token Service<br/>[jsonwebtoken]<br/>Geração e verificação de JWTs"]
            opentelemetry_sdk["OpenTelemetry SDK<br/>[Instrumentation]<br/>Coleta de traces automáticos do GraphQL/SQL/gRPC"]
        end
    end

    gateway -->|Requisições HTTP GraphQL| resolvers
    resolvers -->|Valida parâmetros| validators
    resolvers -->|Invoca| confirmar_pedido_uc
    resolvers -->|Invoca| assinar_recomendacao_uc
    resolvers -->|Invoca| povoar_frota_uc
    resolvers -->|Invoca| atualizar_localizacao_entregador_uc
    resolvers -->|Invoca| obter_rota_estavel_uc
    resolvers -->|Invoca| obter_insights_uc
    resolvers -->|Invoca| login_usuario_uc
    resolvers -->|Invoca| app_services

    confirmar_pedido_uc -->|Usa contratos| domain_ports
    confirmar_pedido_uc -->|Manipula| entities
    confirmar_pedido_uc -->|Instancia| value_objects
    atribuir_entregador_uc -->|Usa contratos| domain_ports
    atribuir_entregador_uc -->|Manipula| entities
    povoar_frota_uc -->|Usa contratos| domain_ports
    povoar_frota_uc -->|Manipula| entities
    atualizar_localizacao_entregador_uc -->|Usa contratos| domain_ports
    atualizar_localizacao_entregador_uc -->|Manipula| entities
    obter_rota_estavel_uc -->|Usa contratos| domain_ports
    obter_insights_uc -->|Usa contratos| domain_ports
    processar_pagamento_uc -->|Usa contratos| domain_ports
    login_usuario_uc -->|Usa contratos| domain_ports

    rabbitmq_consumer -->|Consome eventos| rabbitmq
    rabbitmq_consumer -->|Invoca| atribuir_entregador_uc

    prisma_adapters -.->|Realiza| domain_ports
    grpc_providers -.->|Realiza| domain_ports
    rabbitmq_publisher -.->|Realiza| domain_ports
    token_service -.->|Realiza| domain_ports

    opentelemetry_sdk -.->|Instrumenta| resolvers
    opentelemetry_sdk -.->|Instrumenta| prisma_adapters
    opentelemetry_sdk -.->|Instrumenta| grpc_providers

    prisma_adapters -->|Prisma Client SQL| db_postgres
    rabbitmq_publisher -->|AMQP Publish| rabbitmq
    grpc_providers -->|gRPC: Entregadores| ms_entregadores
    grpc_providers -->|gRPC: Roteamento| ms_roteamento
    grpc_providers -->|gRPC: Recomendação| ms_recomendacao
    redis_client -->|TCP Cache| db_redis

    class gateway,ms_entregadores,ms_roteamento,ms_recomendacao container;
    class db_postgres,db_redis ext;
    class resolvers,validators,confirmar_pedido_uc,atribuir_entregador_uc,assinar_recomendacao_uc,povoar_frota_uc,atualizar_localizacao_entregador_uc,obter_rota_estavel_uc,obter_rota_coleta_uc,obter_rota_entrega_uc,obter_insights_uc,processar_pagamento_uc,login_usuario_uc,app_services,entities,value_objects,domain_ports,prisma_adapters,grpc_providers,rabbitmq_publisher,rabbitmq_consumer,redis_client,token_service,opentelemetry_sdk component;
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
