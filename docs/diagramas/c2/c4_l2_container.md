# Nível 2: Diagrama de Contêineres (Container Diagram)

Detalhamento de todos os contêineres executáveis, bancos de dados, brokers de mensageria e ferramentas de observabilidade da rede interna do Express Delivery.

```mermaid
graph TB
    %% Styling
    classDef person fill:#08427b,stroke:#052e56,stroke-width:2px,color:#fff;
    classDef container fill:#438dd5,stroke:#3b7bb5,stroke-width:2px,color:#fff;
    classDef db fill:#0b132b,stroke:#00b4d8,stroke-width:2px,color:#fff;
    classDef broker fill:#2d1a12,stroke:#f8961e,stroke-width:2px,color:#fff;
    classDef ext fill:#121212,stroke:#666,stroke-width:1px,color:#aaa;
    classDef obs fill:#333333,stroke:#ff5722,stroke-width:2px,color:#fff;

    %% Actors
    cliente["Cliente<br>(Utiliza o sistema para visualizar cardápios, realizar pedidos e acompanhar entregas)"]:::person
    entregador["Entregador<br>(Utiliza o sistema para atualizar sua localização e gerenciar status das entregas)"]:::person
    lojista["Lojista (Restaurante)<br>(Gerencia cardápios, produtos, recebe pedidos e acompanha insights)"]:::person

    %% Containers
    frontend["Frontend Web<br>[React + Vite, TailwindCSS]<br>(Interface Web SPA que fornece as telas para Clientes e Lojistas)"]:::container

    subgraph private_backend ["Rede Privada / Servidores de Backend"]
        gateway["API Gateway (Kong)<br>[Kong 3.4 DB-less]<br>(Gerencia autenticação JWT, CORS, Rate Limiting e roteamento de borda)"]:::container
        api_node["Backend Core (API Node)<br>[TypeScript, Node.js, GraphQL, Prisma]<br>(Orquestrador principal. Provê a API GraphQL, gerencia autenticação, usuários, restaurantes, pedidos e gRPC)"]:::container
        
        ms_entregadores["Microserviço de Entregadores<br>[C#, .NET 10, gRPC]<br>(Gerencia o ciclo de vida, disponibilidade e o rastreamento em tempo real da frota de entregadores)"]:::container
        ms_roteamento["Microserviço de Roteamento<br>[C#, .NET 10, gRPC]<br>(Responsável pelo cálculo de rotas ideais, estimativas de tempos e trajetos de coleta/entrega)"]:::container
        ms_recomendacao["Microserviço de Recomendação<br>[Python, FastAPI, gRPC, SQLAlchemy]<br>(Gera insights analíticos de preços para lojistas baseados em geolocalização e histórico de vendas locais)"]:::container
        ms_notificacoes["Microserviço de Notificações<br>[Python, pika, SMTP]<br>(Consome eventos e envia notificações por e-mail transacionais em background)"]:::container

        %% Databases
        db_postgres[("Banco de Dados Principal<br>[PostgreSQL 15]<br>(Armazena dados transacionais de usuários, restaurantes, produtos, pedidos, pagamentos e avaliações)")]:::db
        db_entregadores[("Banco de Dados Entregadores<br>[PostgreSQL 15]<br>(Armazena dados isolados dos entregadores cadastrados no sistema)")]:::db
        db_recomendacao[("Banco de Dados Recomendação<br>[PostgreSQL 15]<br>(Armazena o histórico analítico de vendas e as réplicas locais de dados para geoprocessamento)")]:::db
        db_redis[("Cache e Posições (Redis)<br>[Redis 7]<br>(Armazena posições geográficas em tempo real dos entregadores (Redis Geo) e serve como cache-aside de queries GraphQL)")]:::db

        %% Messaging
        rabbitmq["RabbitMQ Message Broker<br>[RabbitMQ 3]<br>(Roteia eventos assíncronos (pedido.confirmado, pagamento.aprovado, entrega.atribuida) entre serviços)"]:::broker
        kafka_cdc["Plataforma CDC (Kafka + Debezium)<br>[Apache Kafka, Debezium Connect]<br>(Captura alterações de dados (WAL) no banco de dados principal e replica para os microsserviços interessados)"]:::broker
    end

    subgraph externals ["Serviços Externos"]
        osrm_server["Servidor de Roteamento (OSRM)<br>[C++ Engine]<br>(Servidor OSRM que resolve caminhos geométricos e estimativas físicas reais)"]:::ext
        stripe["Gateway de Pagamento (Stripe)<br>(Processa transações financeiras de forma segura)"]:::ext
        mailtrap["Servidor de E-mail (Mailtrap/SMTP)<br>(Sandbox de testes de envio de emails transacionais)"]:::ext
    end

    subgraph observability ["Observabilidade"]
        jaeger["Jaeger Tracing<br>[Jaeger All-in-One]<br>(Centraliza a visualização de traces distribuídos gRPC/GraphQL)"]:::obs
        prometheus["Prometheus Metrics<br>[Prometheus Server]<br>(Coleta métricas temporais das aplicações instrumentadas)"]:::obs
        grafana["Grafana Dashboards<br>[Grafana OSS]<br>(Visualiza painéis analíticos e métricas consolidadas do sistema)"]:::obs
    end

    %% Flows
    cliente -->|Interage com a interface [HTTPS/SPA]| frontend
    lojista -->|Acessa o painel do restaurante [HTTPS/SPA]| frontend
    frontend -->|Envia requisições GraphQL [HTTPS/JSON (Port 8000)]| gateway
    entregador -->|Transmite fluxo de coordenadas [gRPC Stream (Port 5001)]| ms_entregadores

    gateway -->|Encaminha requisições GraphQL [HTTP/GraphQL (Port 4000)]| api_node
    api_node -->|Grava/lê dados transacionais [Prisma Client (Port 5433)]| db_postgres
    api_node -->|Lê/grava cache-aside de queries [TCP/ioredis (Port 6379)]| db_redis
    api_node -->|Consulta entregadores próximos [gRPC Client (Port 5001)]| ms_entregadores
    api_node -->|Solicita cálculo de rota [gRPC Client (Port 5002)]| ms_roteamento
    api_node -->|Busca insights e atualiza assinatura [gRPC Client (Port 50053)]| ms_recomendacao
    api_node -->|Publica eventos [AMQP/amqplib (Port 5672)]| rabbitmq
    api_node -->|Solicita cobrança de cartões/Pix [HTTPS/REST API]| stripe

    ms_entregadores -->|Persiste entregadores [ADO.NET/EF Core (Port 5434)]| db_entregadores
    ms_entregadores -->|Salva posições geográficas [Redis Geo Commands (Port 6379)]| db_redis
    ms_entregadores -->|Publica entrega.atribuida / Consome pedido.confirmado [AMQP (Port 5672)]| rabbitmq

    ms_roteamento -->|Consulta estimativas e trajetos físicos [HTTP/JSON (Port 5080)]| osrm_server

    ms_recomendacao -->|Grava histórico analítico e réplicas [SQLAlchemy (Port 5436)]| db_recomendacao
    ms_recomendacao -->|Consome pedido.confirmado [AMQP (Port 5672)]| rabbitmq

    ms_notificacoes -->|Consome eventos para disparar e-mails [AMQP (Port 5672)]| rabbitmq
    ms_notificacoes -->|Dispara e-mails transacionais [SMTP/TCP (Port 2525)]| mailtrap

    db_postgres -->|Lê logs de transações (WAL) [Logical Replication (Port 5433)]| kafka_cdc
    kafka_cdc -->|Transmite réplicas de restaurantes e produtos [Kafka Protocol (Port 9092)]| ms_recomendacao

    %% Traces and Metrics
    api_node -. "Envia traces [OTLP/gRPC (Port 4317)]" .-> jaeger
    ms_entregadores -. "Envia traces [OTLP/gRPC (Port 4317)]" .-> jaeger
    ms_roteamento -. "Envia traces [OTLP/gRPC (Port 4317)]" .-> jaeger
    ms_recomendacao -. "Envia traces [OTLP/gRPC (Port 4317)]" .-> jaeger
    ms_notificacoes -. "Envia traces [OTLP/HTTP (Port 4318)]" .-> jaeger

    prometheus -. "Scrape de métricas [HTTP]" .-> api_node
    prometheus -. "Scrape de métricas [HTTP]" .-> ms_recomendacao
    prometheus -. "Scrape de métricas [HTTP]" .-> ms_entregadores

    grafana -->|Consulta métricas [HTTP/REST API]| prometheus
    grafana -->|Busca traces [HTTP/REST API]| jaeger
```

---
[⬅️ Voltar para o README](../../../README.md)
