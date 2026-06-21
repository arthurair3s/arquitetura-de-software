# Nível 3: Diagrama de Componentes (Component Diagram)

Detalhamento dos componentes lógicos internos e das camadas de design (Clean Architecture/DDD) do **Backend Core (API Node)**.

```mermaid
graph TB
    %% Styling
    classDef container fill:#438dd5,stroke:#3b7bb5,stroke-width:2px,color:#fff;
    classDef comp fill:#85bbf0,stroke:#6699cc,stroke-width:2px,color:#000;
    classDef port fill:#e9c46a,stroke:#f4a261,stroke-width:2px,color:#000;
    classDef ext fill:#999999,stroke:#777777,stroke-width:2px,color:#fff;

    %% External Containers
    gateway["API Gateway (Kong)<br>[Kong 3.4]<br>(Encaminha requisições GraphQL autorizadas)"]:::container
    db_postgres[("Banco de Dados Principal<br>[PostgreSQL 15]<br>(Armazena dados transacionais do sistema principal)")]:::ext
    db_redis[("Cache (Redis)<br>[Redis 7]<br>(Guarda cache-aside e posições geográficas)")]:::ext
    rabbitmq["RabbitMQ<br>[RabbitMQ 3]<br>(Broker de eventos assíncronos)"]:::ext
    ms_entregadores["Microserviço de Entregadores<br>[C# / gRPC]<br>(Gerencia a frota de entregadores)"]:::container
    ms_roteamento["Microserviço de Roteamento<br>[C# / gRPC]<br>(Calcula rotas e caminhos)"]:::container
    ms_recomendacao["Microserviço de Recomendação<br>[Python / gRPC]<br>(Fornece insights analíticos de vendas)"]:::container

    subgraph api_node ["Backend Core (API Node)"]
        subgraph presentation ["Camada de Apresentação"]
            resolvers["GraphQL Resolvers<br>[Apollo Server]<br>(Recebe consultas/mutações e interage com os Use Cases e Serviços)"]:::comp
        end

        subgraph application ["Camada de Aplicação (Use Cases)"]
            validators["Validadores (Zod)<br>(Validam as payloads de entrada do GraphQL)"]:::comp
            
            uc_pedido["ConfirmarPedidoUseCase<br>(Caso de uso para criar/confirmar um novo pedido e publicar o evento)"]:::comp
            uc_entrega["AtribuirEntregadorUseCase<br>(Caso de uso para registrar a entrega atribuída a um entregador)"]:::comp
            uc_assinatura["AssinarPlanoRecomendacaoUseCase<br>(Caso de uso para gerenciar assinaturas premium no MS Recomendação)"]:::comp
            uc_frota["PovoarFrotaUseCase<br>(Caso de uso para povoamento e simulação espacial de frotas de entregadores)"]:::comp
            uc_localizacao["AtualizarLocalizacaoEntregadorUseCase<br>(Caso de uso para validar e atualizar a localização geo-espacial)"]:::comp
            uc_rota["ObterRotaEstavelUseCase<br>(Caso de uso para obter rota estável da entrega)"]:::comp
            uc_coleta["ObterRotaColetaUseCase<br>(Caso de uso para obter rota de coleta)"]:::comp
            uc_entrega_rota["ObterRotaEntregaUseCase<br>(Caso de uso para obter rota de entrega)"]:::comp
            uc_insights["ObterInsightsUseCase<br>(Caso de uso para consultar insights analíticos via gRPC)"]:::comp
            uc_pagamento["ProcessarPagamentoUseCase<br>(Caso de uso para gerenciar pagamentos seguros via Stripe)"]:::comp
            uc_login["LoginUsuarioUseCase<br>(Caso de uso para login e autenticação com JWT)"]:::comp
            
            app_services["Serviços de Aplicação<br>(Implementam as portas de serviço secundárias ou genéricas)"]:::comp
        end

        subgraph domain ["Camada de Domínio (Core)"]
            entities["Entidades de Domínio<br>(Modelos ricos com lógica e invariantes de negócio, ex: Usuario, Pedido, Pagamento, Restaurante)"]:::comp
            value_objects["Value Objects<br>(Objetos de valor imutáveis autovalidados, ex: Coordenada, Dinheiro, Email, StatusPedido)"]:::comp
            domain_ports["Portas (Interfaces)<br>(Definem contratos de repositórios e integrações, ex: IPedidoRepository, IEventPublisher)"]:::port
        end

        subgraph infrastructure ["Camada de Infraestrutura"]
            prisma_adapters["Adaptores Prisma<br>(Implementam as interfaces de repositórios do domínio conectando no Prisma Client)"]:::comp
            rabbitmq_pub["RabbitMQPublisher<br>(Implementa a interface IEventPublisher para disparar eventos assíncronos)"]:::comp
            rabbitmq_con["RabbitMQConsumer<br>(Consome eventos de filas e orquestra Use Cases correspondentes)"]:::comp
            grpc_providers["Provedores gRPC (Clients)<br>(Implementam portas gRPC de integração com microserviços externos)"]:::comp
            redis_client["RedisClient Singleton<br>(Mantém a conexão Singleton e executa comandos de cache no Redis)"]:::comp
            token_service["Serviço de Token (JWT)<br>(Implementa ITokenService para autenticação)"]:::comp
            opentelemetry_sdk["OpenTelemetry SDK<br>(Inicializa o tracing distribuído e a instrumentação do Node.js/GraphQL)"]:::comp
        end
    end

    %% Flows
    gateway -->|HTTP GraphQL| resolvers
    resolvers -->|Valida inputs| validators
    
    %% Resolver UCs
    resolvers -->|Invoca| uc_pedido
    resolvers -->|Invoca| uc_assinatura
    resolvers -->|Invoca| uc_frota
    resolvers -->|Invoca| uc_localizacao
    resolvers -->|Invoca| uc_rota
    resolvers -->|Invoca| uc_coleta
    resolvers -->|Invoca| uc_entrega_rota
    resolvers -->|Invoca| uc_insights
    resolvers -->|Invoca| uc_login
    resolvers -->|Invoca| app_services

    %% Use Cases -> Domain & Ports
    uc_pedido -->|Usa contratos| domain_ports
    uc_pedido -->|Manipula| entities
    uc_pedido -->|Instancia| value_objects
    
    uc_entrega -->|Usa contratos| domain_ports
    uc_entrega -->|Manipula| entities
    
    uc_frota -->|Usa contratos| domain_ports
    uc_frota -->|Manipula| entities

    rabbitmq_con -->|Consome eventos| rabbitmq
    rabbitmq_con -->|Invoca| uc_entrega

    %% Dependency Inversion (Infra implements Ports)
    prisma_adapters -.->|Implements| domain_ports
    rabbitmq_pub -.->|Implements| domain_ports
    grpc_providers -.->|Implements| domain_ports
    token_service -.->|Implements| domain_ports

    %% Instrumentation
    opentelemetry_sdk -.->|Instrumenta| resolvers
    opentelemetry_sdk -.->|Instrumenta| prisma_adapters
    opentelemetry_sdk -.->|Instrumenta| grpc_providers

    %% Connect to external resources
    prisma_adapters -->|SQL [Port 5433]| db_postgres
    rabbitmq_pub -->|AMQP [Port 5672]| rabbitmq
    redis_client -->|TCP [Port 6379]| db_redis
    grpc_providers -->|gRPC [Port 5001]| ms_entregadores
    grpc_providers -->|gRPC [Port 5002]| ms_roteamento
    grpc_providers -->|gRPC [Port 50053]| ms_recomendacao
```

---
[⬅️ Voltar para o README](../../README.md)
